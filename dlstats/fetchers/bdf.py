# -*- coding: utf-8 -*-
"""
Created on Tue May 24 12:33:35 2016

@author: SHENGXI
"""

from lxml import etree
import requests
import logging
import xlrd
import re
import traceback
from datetime import datetime

from collections import defaultdict, OrderedDict

from dlstats.utils import Downloader, get_ordinal_from_period, make_store_path
from dlstats.fetchers._commons import Fetcher, Datasets, Providers, SeriesIterator

INDEX_URL='http://webstat.banque-france.fr/en/concepts.do?node=DATASETS'
logger = logging.getLogger(__name__)

def download_page(url):
    url = url.strip()
    response = requests.get(url)
    
    if not response.ok:
        msg = "download url[%s] - status_code[%s] - reason[%s]" % (url, 
                                                                   response.status_code, 
                                                                   response.reason)
        logger.error(msg)
        response.raise_for_status()

    return response.content

def parse_site():
    url = INDEX_URL
    page = download_page(url)
    html = etree.HTML(page)
    anchors = html.findall('.//div[@class="childrenNode leaf"]/h4/a')
    site_tree = []
    for a in anchors:
        site_tree.append(make_category(a))
    return site_tree
    
def make_category(anchors):
    category = OrderedDict()
    category['name'] = re.match('\((.*)\) (.*)', anchors.text).group(2)
    category['category_code'] = re.match('\((.*)\) (.*)', anchors.text).group(1)
    category['parent'] = 'concept'
    category['all_parents'] = ['concept']
    category['datasets'] = make_dataset(anchors)
    return category

def make_dataset(anchors):
    dataset = OrderedDict()
    dataset['name'] = re.match('\((.*)\) (.*)', anchors.text).group(2)
    dataset['dataset_code'] = re.match('\((.*)\) (.*)', anchors.text).group(1)
    dataset['last_update'] = datetime(2016, 6, 20)
    dataset['metadata'] = {}
    dataset['metadata']['url'] = 'http://webstat.banque-france.fr/en/export.do?node=DATASETS_%s&exportType=sdmx' % (dataset['dataset_code'])
    dataset['metadata']['doc_href'] = None
    return [dataset]

def get_dataflow_key_from_info_page(url):
    page = download_page(url)
    html = etree.HTML(page)
    tr = html.find('.//div[@class="tabs content"]')
    key = tr.get('data-dsname')
    return key
   
def get_update(tr, last_update):
    anchors = list(tr[1])[0]
    update = dict()
    update['id'] = tr.get('data-id')
    update['url'] = "http://webstat.banque-france.fr/en/export.do?node=UPDATES%s&exportType=sdmx" % (update['id'])
    url_infopage = "http://webstat.banque-france.fr/en/browseExplanation.do?node=UPDATES%s" % (update['id'])
    update['dataflow_key'] = get_dataflow_key_from_info_page(url_infopage)
    update['last_update'] = last_update
    update['name'] = anchors.text
    return update
    
def make_xls_url(dataset_code):
    url = "http://webstat.banque-france.fr/en/browseExplanation.do?node=DATASETS_%s" % (dataset_code)
    req = requests.get(url)
    page = req.content
    html = etree.HTML(page)
    anchors = html.xpath('.//a[starts-with(@href,"javascript:")]')
    v = anchors[0].get('href')
    req = re.match(r".*\(\'(.*)\',\'(.*)\',\'(.*)\'\).*", v)
    url = "http://webstat.banque-france.fr/en/exportDsd.do?datasetId=%s&datasetName=%s&keyFamily=%s&node=DATASETS_%s" % (req.group(1), req.group(2), req.group(3), dataset_code)
    return url
    
def get_sheet_cells(fp, name):
    index = fp.sheet_by_name(name)
    keys = index.col_values(0, 3)
    values = index.col_values(1, 3)
    d = OrderedDict(zip(keys, values))
    return d

def get_concepts(fp):
    return get_sheet_cells(fp, 'index')

def get_codelists(fp, dimension_keys):
    codelists = dict((k, {}) for k in dimension_keys) 
    for k in dimension_keys:
        codelists[k] = get_sheet_cells(fp, k)
    return codelists
       
def get_ns(fp):
    '''Get the namespace like urn:sdmx:org.sdmx.infomodel.datastructure.DataStructure=BDF:BDF_AME1(1.0)'''
    nsmap = list()
    context = etree.iterparse(fp, events=['start-ns'], remove_blank_text=True)
    for event, elem in context:
        nsmap.append(elem)
        s = '{%s}' % (nsmap[-1][1])
    return s
    
def get_events(fp, ns):
    '''Build the iterator of events'''
    context = etree.iterparse(fp, events=['end'], tag=(ns + 'Group', ns + 'Series', ns + 'Obs'), remove_blank_text=True)
    return context
    
def get_dates(dim, obs):
    frequency = dim['FREQ']
    start_date = get_ordinal_from_period(obs[0]['TIME_PERIOD'], freq=frequency)
    end_date = get_ordinal_from_period(obs[-1]['TIME_PERIOD'], freq=frequency)
    return frequency, start_date, end_date
    

class BDF(Fetcher):
    def __init__(self, **kwargs):
        super().__init__(provider_name='BDF', version=2, **kwargs)
        
        self.provider = Providers(name=self.provider_name,
                                  long_name='Banque de France',
                                  version=2,
                                  region='France',
                                  website='http://webstat.banque-france.fr/',
                                  fetcher=self)           
        self.categories_filter = ['AME', 'TCN1', 'DET']
        
    def build_data_tree(self):
        categories = parse_site()
        return categories
    
    def upsert_dataset(self,dataset_code):
        self.get_selected_datasets()        
        self.dataset_settings = self.selected_datasets[dataset_code]
        dataset = Datasets(provider_name=self.provider_name,
                           dataset_code=dataset_code,
                           name=self.dataset_settings["name"],
                           last_update=self.dataset_settings['last_update'],
                           fetcher=self)
                           
        url = self.dataset_settings['metadata']['url']
        dataset.series.data_iterator = BDF_Data(dataset,url)        
        return dataset.update_database()
    
    def load_datasets_update(self):
        for d in self._parse_agenda():
            if d['dataflow_key'] in self.datasets_filter:
                dataset = Datasets(provider_name=self.provider_name,
                                   dataset_code=d['dataflow_key'],
                                   name=d['name'],
                                   last_update=d['last_update'],
                                   fetcher=self)
                url = d['url']                
                dataset.series.data_iterator = BDF_Data(dataset, url)
                dataset.update_database()    
                msg = "get update - provider[%s] - dataset[%s] - last-update-dataset[%s]"    
                logger.info(msg % (self.provider_name, d['dataflow_key'], d['last_update']))                  
    
    def _parse_agenda(self):
        url = "http://webstat.banque-france.fr/en/updates.do"
        page_agenda = download_page(url)
        html = etree.HTML(page_agenda)
        trs = html.findall('.//tr[@data-url]')
        for tr in trs:
            td = list(tr)[0]
            date1 = td.text.split('-')
            date2 = datetime.datetime.now()
            last_update = datetime.datetime(int(date1[2]), int(date1[1]), int(date1[0]), 23, 59, 59)
            if last_update >= date2-datetime.timedelta(days=1):
                update = get_update(tr, last_update)      
                yield(update)
            else:
                break
    
    def get_calendar(self):
        yield {'action': 'update-fetcher',
               'kwargs': {'provider_name': self.provider_name},
               'period_type': 'cron',
               "period_kwargs": { 
                   "day": '*', 
                   "hour": 0, 
                   "minute": 1, 
                   "timezone": 'Europe/Paris'
                }
              } 
                           
class BDF_Data(SeriesIterator):
    def __init__(self, dataset, url):
        super().__init__(dataset)

        self.dataset_url = url
        self.release_date = self.dataset.last_update
        
        xls_handle = xlrd.open_workbook(self._load_xls())
        self.dataset.concepts = get_concepts(xls_handle)
        self.dataset.dimension_keys = get_concepts(xls_handle).keys()
        self.dataset.attribute_keys=[]
        self.dataset.codelists = get_codelists(xls_handle, self.dataset.dimension_keys)
        
        self.filepath = self._load_datas()       
        self.nsString = get_ns(self.filepath)
        self.file_handle = None
                
        self.nbseries = 0
        self.nbIteration = 0

    def get_store_path(self):
        return make_store_path(base_path=self.fetcher.store_path,
                               dataset_code=self.dataset_code)
    
    def _load_datas(self):
        download = Downloader(url=self.dataset_url, 
                              filename=self.dataset_code,
                              store_filepath=self.get_store_path(),
                              use_existing_file=self.fetcher.use_existing_file)
        filepath = download.get_filepath()
        return filepath 
    
    def _load_xls(self):
        url_xls = make_xls_url(self.dataset_code)
        download = Downloader(url=url_xls, 
                          filename=self.dataset_code + '_info.xls',
                          store_filepath=self.get_store_path(),
                          use_existing_file=self.fetcher.use_existing_file)
        filepath = download.get_filepath()
        return filepath
        
    def fix_series_keys(self, dimension):
        key='%s.%s' % (self.dataset_code, '.'.join(dimension.values()))
        return key
                        
    def __next__(self):
        '''try...except... for closing the file when an error occurs'''
        try:
            if not self.file_handle:
                self.file_handle = open(self.filepath, 'rb')
                self.context = get_events(self.file_handle, self.nsString)
    			
            self.nbIteration += 1
            for event,elem in self.context:
                if elem.tag == self.nsString + 'Group':
                    group = OrderedDict((k,v) for k,v in elem.attrib.items())
                    obs = list()
                    self.nbseries += 1
                    elem.clear()
                elif elem.tag == self.nsString + 'Obs':
                    obs.append(OrderedDict((k,v) for k,v in elem.attrib.items()))
                    elem.clear()
                elif elem.tag == self.nsString + 'Series':
                    p_series = OrderedDict((k,v) for k,v in elem.attrib.items())               
                    elem.clear()
                    break          
            if self.nbIteration == self.nbseries:
                series = self.clean_field(self._build_series(group, p_series, obs))        
        except:
            self.file_handle.close()
            traceback.print_exc()
            raise StopIteration()
        
        if self.nbIteration != self.nbseries:
            self.file_handle.close()
            raise StopIteration()    
        return series
    
    def clean_field(self, bson):   
        bson = super().clean_field(bson)
        return bson
                        
    def _build_series(self, group, p_series, obs):
        dimensions = OrderedDict()
        attributes = OrderedDict()
        bson = OrderedDict() 
        dim = group.copy()
        dim.update(p_series) 
        attrib = defaultdict(list)

        frequency, start_date, end_date = get_dates(dim, obs)
        self.dataset.add_frequency(frequency)
        
        values=list()
        for v in obs:
            Obs_attribute_keys = [k for k in v.keys() if k not in ['TIME_PERIOD', 'OBS_VALUE']]            
            
            for key in Obs_attribute_keys:
                if key not in self.dataset.attribute_keys:
                    self.dataset.attribute_keys.append(key)
                    self.dataset.concepts[key] = key
                    self.dataset.codelists[key] = {}
                if v.get(key) not in self.dataset.codelists[key]:
                    self.dataset.codelists[key][v.get(key)] = v.get(key)

        for v in obs: 
            period = v['TIME_PERIOD']
            a=OrderedDict()
            for k in self.dataset.attribute_keys:
                try:
                    a[k]=v[k]
                except KeyError:
                    a[k]=''
                attrib[k].append(a[k])                        
            value = { 'attributes': a,
                    'release_date': self.release_date,
                    'ordinal': get_ordinal_from_period(period, freq=frequency),
                    'period': period,
                    'value': v['OBS_VALUE']
                    }
            values.append(value)

        for key in self.dataset.dimension_keys:
            dimensions[key] = self.dimension_list.update_entry(key,
                                                                dim[key], 
                                                                self.dataset.codelists[key][dim[key]])           
        for key in self.dataset.attribute_keys:
            attributes[key] = self.attribute_list.update_entry(key,
                                                                str(attrib[key]),
                                                                attrib[key])
            
        series_name = dim['TITLE_COMPL']
        series_key =  self.fix_series_keys(dimensions)
    
        bson['values'] = values                
        bson['provider_name'] = self.provider_name       
        bson['dataset_code'] = self.dataset_code
        bson['name'] = series_name
        bson['key'] = str(series_key)
        bson['start_date'] = start_date
        bson['end_date'] = end_date
        bson['last_update'] = self.release_date
        bson['dimensions'] = dimensions
        bson['frequency'] = frequency
        bson['attributes'] = attributes
        return bson