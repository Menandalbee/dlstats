# -*- coding: utf-8 -*-
"""
Created on Wed Jun 29 14:40:56 2016

@author: SHENGXI
"""

from lxml import etree
import requests
import logging
import re
import traceback
import json
import unicodedata
import urllib

from collections import defaultdict, OrderedDict

from dlstats.utils import Downloader, get_ordinal_from_period, make_store_path, clean_datetime
from dlstats.fetchers._commons import Fetcher, Datasets, Providers, Categories, SeriesIterator

INDEX_URL="http://data.stats.gov.cn/english/easyquery.htm"
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
    li = html.findall('.//ul[@id="treeZhiBiao_3_ul"]/li')
    return li
    
def make_code(name):
    if "preceding year" in name or "1978" in name:
        s = re.match(r'(.*)(\(.*\))', name)
        code = re.sub(r'[^A-Z]+', r'', s.group(1)) + s.group(2) 
    else:
        code = re.sub(r'[^A-Z\(\)]', r'', name)
    return code

def make_dataset(node, _category_code):
    dataset = {
        'name': node['name'],
        'dataset_code': make_code(node['name']),
        'last_update': None,
        'metadata': {
            'url': None,
            'doc_href': None
        }
    }
    
    if len(dataset['dataset_code']) < 3:
        dataset['dataset_code'] = _category_code
    elif dataset['dataset_code'] == "V(preceding year=100)":
        dataset['dataset_code'] = "NA.V(preceding year=100)"
    elif dataset['dataset_code'] == "V(1978=100)":
        dataset['dataset_code'] = "NA.V(1978=100)"
    return dataset

def get_tableData(node):
    payload = {
        'm': "QueryData", 
        'dbcode': "hgnd",
        'rowcode': "zb",
        'colcode': "sj",
        'wds': "[]",
        'dfwds': '[{"wdcode":"zb","valuecode":%s}]' % (node['id']),
        'k1': "1470125034252"
    }
    requests.get("http://data.stats.gov.cn/english/easyquery.htm", params=payload)
    req = requests.get("http://data.stats.gov.cn/english/easyquery.htm?m=QueryData&dbcode=hgnd&rowcode=zb&colcode=sj&wds=[]&dfwds=[{%22wdcode%22:%22sj%22,%22valuecode%22:%22LAST20%22}]&k1=1470126105760")
    data_20 = req.json()   
    return data_20

def make_url(data): 
    year = [str(i) for i in range(1995, 2015)]
    year.append("Indicators")
    year.reverse()
    str_year = "--".join(year)
    th = '%s:"%s' % ('"data"', str_year) 
    d = list()
    d.append(th)
    
    wdnodes = data['returndata']['wdnodes'][0]['nodes']
    datanodes = data['returndata']['datanodes'] 
    nbIndi = len(wdnodes)
    for i in range(nbIndi):
        doc = list()
        indicator = "%s(%s)" % (wdnodes[i]['name'], wdnodes[i]['unit'])
        doc.append(indicator)
        for j in range(20*i, 20*(i+1)):
            if len(datanodes[j]['data']['strdata']) != 0:
                doc.append(datanodes[j]['data']['strdata'])
            else:
                doc.append("empty")
        str_doc = "--".join(doc)
        d.append(str_doc)   
    str_data = '{%s##",%s}' % ("##".join(d), '"title":"Annual","dataSource":"National+Bureau+of+Statistics","dbcode":"Database：Annual","rowcode":"zb","colcode":"sj","explain":"Note:"')
   
    payload = {
        'ifNormal': "true",
        'type': "xml",
        'pdfWidth': "1200",
        'otherwds': '[{"wdname":"Year","wdcode":"sj","valuecode":"LATEST20"}]',
        'tableData': str_data,
        'exps': '[]'
    }
    params = urllib.parse.urlencode(payload) 
    url = "http://data.stats.gov.cn/english/download.htm?%s" % (params)
    return url
    
def get_events(fp):
    '''Build the iterator of events'''
    context = etree.iterparse(fp, events=['end'], tag=['database', 'record', 'data', 'root'], remove_blank_text=True)
    return context
    
def get_dates(periods, frequency):
    start_date = get_ordinal_from_period(periods[-1], freq=frequency)
    end_date = get_ordinal_from_period(periods[0], freq=frequency)
    return start_date, end_date
    
def clean_quarterly(period_quarterly):
    return re.sub(r'([1-4])Q (.*)', r'\2-Q\1', period_quarterly)


class NBS(Fetcher):
    def __init__(self, **kwargs):
        super().__init__(provider_name='NBS', version=2, **kwargs)
        
        self.provider = Providers(name=self.provider_name,
                                  long_name='National Bureau of Statistics of China',
                                  version=2,
                                  region='China',
                                  website='http://data.stats.gov.cn/',
                                  fetcher=self)           
        self.categories_filter = []
        
    def build_data_tree(self):
        categories = list()
                
        def make_category(li, parent_key, position):
            name = li.xpath('./a')[0].get('title')
            _category_code = "%s.%s" % (parent_key, make_code(name))
            if not li.xpath('./ul') and position == 1:  
                _category = {
                    'name': name,
                    'category_code': _category_code,
                    'position': position,
                    'parent': parent_key,
                    'all_parents': [],
                    'datasets': [make_dataset(name, _category_code)]
                }                
                categories.append(_category)
            elif not li.xpath('./ul') and position != 1:                
                categories[-1]['datasets'].append(make_dataset(name, _category_code))               
            else:          
                _category = {
                    'name': name,
                    'category_code': _category_code,
                    'position': position,
                    'parent': parent_key,
                    'all_parents': [],
                    'datasets': []
                }
                categories.append(_category)
                
                position += 1
                for child_li in li.xpath('./ul/li'):
                    make_category(child_li, _category['category_code'], position)                

        _parent_category = {
            'name': 'National Accounts',
            'category_code': 'NA',
            'position': 0,
            'parent': None,
            'all_parents': [],
            'datasets': []
        }
        categories.append(_parent_category)

        position = 1          
        try:
            for li in parse_site():
                make_category(li, "NA", position)  
        except Exception as err:
            logger.error(err)
            raise
            
        _categories = dict([(cat['category_code'], cat) for cat in categories])
        
        for c in categories:
            parents = Categories.iter_parent(c, _categories)
            c['all_parents'] = parents
            
        return categories    

class NBS_Data(SeriesIterator):
    def __init__(self, dataset, url):
        super().__init__(dataset)
        self.store_path=self.get_store_path()
        
        self.dataset_url = url
        self.release_date = self.dataset.last_update
        
        self.dataset.dimension_keys = ['FREQ','UNIT']
        self.dataset.attribute_keys=[]
        self.dataset.concepts={'FREQ':'Frequency', 'UNIT':'Unit'}
        
        self.filepath = self._load_datas()       
        self.file_handle = None
         
        self.name_series = None         
        self.nbseries = 0
    
    def _load_datas(self):
        download = Downloader(url=self.dataset_url, 
                              filename=self.dataset_code,
                              store_filepath=self.get_store_path(),
                              use_existing_file=self.fetcher.use_existing_file)
        filepath = download.get_filepath()
        return filepath 
                        
    def __next__(self):
        '''try...except... for closing the file when an error occurs'''
        try:
            if not self.file_handle:
                self.file_handle = open(self.filepath, 'rb')
                self.context = get_events(self.file_handle)
    			
            for event, elem in self.context:
                if elem.tag == 'root':
                    elem.clear()
                    raise StopIteration()
                
                if elem.tag == 'data':
                    self.nbseries +=1
                    series = self.clean_field(self._build_series(self.name_series, self.periodslist, self.valueslist, self.freq))
                    elem.clear()                     
                    return series 
                    
                if elem.tag == 'database':
                    text = unicodedata.normalize('NFKC', elem.text)
                    if text == "Database:Annual":
                        self.freq = {'A': 'Annual'}
                    if text == "Database:Quarterly":
                        self.freq = {'Q': 'Quarterly'}
                    elem.clear()
                    continue
                    
                children=list(elem)
                if not self.name_series:
                    self.name_series = children[0].text
                    self.periodslist = list()
                    self.valueslist = list()
                    
                name = children[0].text
                if name == self.name_series:
                    self.periodslist.append(children[1].text)
                    self.valueslist.append(children[2].text)
                    elem.clear()
                    continue
                else:
                    self.nbseries +=1
                    series = self.clean_field(self._build_series(self.name_series, self.periodslist, self.valueslist, self.freq))   
                    self.name_series = name
                    self.periodslist = list()
                    self.periodslist.append(children[1].text)
                    self.valueslist = list()
                    self.valueslist.append(children[2].text)
                    elem.clear()
                    break      
        except:
            self.file_handle.close()
            traceback.print_exc()
            raise StopIteration()  
        return series
    
    def clean_field(self, bson):   
        bson = super().clean_field(bson)
        return bson
                        
    def _build_series(self, name_series, periodslist, valueslist, freq):
        dimensions = OrderedDict()
        attributes = OrderedDict()
        bson = OrderedDict()  
        
        frequency = list(freq.keys())[0]
        if frequency == 'Q':
            periodslist = [clean_quarterly(p) for p in periodslist]       
        unit = re.match(r'.*\((.*)\)', name_series).group(1)
        start_date, end_date = get_dates(periodslist, frequency)
        self.dataset.add_frequency(frequency)
                
        values = list()
        for i in range(len(valueslist)):
            value = {
                        'attributes': None,
                        'release_date': self.release_date,
                        'ordinal': get_ordinal_from_period(periodslist[i], freq=frequency),
                        'period': periodslist[i],
                        'value': valueslist[i],
            }
            values.append(value)
                    
        dimensions['FREQ'] = self.dimension_list.update_entry('FREQ', frequency, freq[frequency]) 
        dimensions['UNIT'] = self.dimension_list.update_entry('UNIT', unit, unit)

        if 'FREQ' not in self.dataset.codelists:
            self.dataset.codelists['FREQ'] = {}
        if  dimensions['FREQ'] not in self.dataset.codelists['FREQ']:
            self.dataset.codelists['FREQ'][dimensions['FREQ']] = freq[dimensions['FREQ']]
        
        if 'UNIT' not in self.dataset.codelists:
            self.dataset.codelists['UNIT'] = {}
        if dimensions['UNIT'] not in self.dataset.codelists['UNIT']:
            self.dataset.codelists['UNIT'][dimensions['UNIT']] = dimensions['UNIT']                                                        
        
        series_key =  self.nbseries
        
        bson['values'] = values                
        bson['provider_name'] = self.provider_name       
        bson['dataset_code'] = self.dataset_code
        bson['name'] = name_series
        bson['key'] = str(series_key)
        bson['start_date'] = start_date
        bson['end_date'] = end_date
        bson['last_update'] = self.release_date
        bson['dimensions'] = dimensions
        bson['frequency'] = frequency
        bson['attributes'] = attributes
        return bson