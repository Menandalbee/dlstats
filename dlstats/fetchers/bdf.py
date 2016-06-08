# -*- coding: utf-8 -*-
"""
Created on Tue May 24 12:33:35 2016

@author: SHENGXI
"""

from lxml import etree
from collections import defaultdict,OrderedDict

from dlstats.utils import Downloader, get_ordinal_from_period, make_store_path,get_datetime_from_period
from dlstats.fetchers._commons import Fetcher, Datasets, Providers, Categories
        
def get_ns(fp):
    '''Get the namespace like urn:sdmx:org.sdmx.infomodel.datastructure.DataStructure=BDF:BDF_AME1(1.0)'''
    nsmap=list()
    context=etree.iterparse(fp,events=['start-ns'],remove_blank_text=True)
    for event,elem in context:
        nsmap.append(elem)
        s='{'+nsmap[-1][1]+'}'
    return s
    
def get_events(fp,ns):
    '''Build the iterator of events'''
    context=etree.iterparse(fp,events=['end'],tag=(ns+'Group',ns+'Series',ns+'Obs'),remove_blank_text=True)
    return context
    
def get_dates(dim,obs):
    frequency=dim['FREQ']
    start_date=obs[0]['TIME_PERIOD']
    end_date=obs[-1]['TIME_PERIOD']
    return frequency,start_date,end_date
    
        
class BDF_Data:
    def __init__(self, dataset, url):
        self.dataset = dataset
        self.dataset_url = url
        self.fetcher = self.dataset.fetcher          
        self.provider_name = self.dataset.provider_name
        self.dataset_code = self.dataset.dataset_code
        self.release_date = self.dataset.last_update
        self.dimension_list = self.dataset.dimension_list
        self.attribute_list = self.dataset.attribute_list
        
        self.store_path=self.get_store_path()
        self.filepath=self._load_datas()

        self.nsString=get_ns(self.filepath)
        self.context=None
        self.file_handle=None
        
        self.nbseries=0
        self.nbIteration=0

    def get_store_path(self):
        return make_store_path(base_path=self.fetcher.store_path,
                               dataset_code=self.dataset_code)
    
    def _load_datas(self):
        download = Downloader(url=self.dataset_url, 
                              filename=self.dataset_code,
                              store_filepath=self.store_path,
                              use_existing_file=self.fetcher.use_existing_file)
        filepath = download.get_filepath()
        return filepath 
    
    def __iter__(self):
        return self
        
    def __next__(self):
        '''try...except... for closing the file when an error occurs'''
        try:
            if not self.context:
                self.file_handle=open(self.filepath,'rb')
                self.context=get_events(self.file_handle,self.nsString)
    			
            self.nbIteration+=1
            for event,elem in self.context:
                if elem.tag==self.nsString+'Group':
                    group=OrderedDict((k,v) for k,v in elem.attrib.items())
                    obs=list()
                    self.nbseries+=1
                    elem.clear()
                elif elem.tag==self.nsString+'Obs':
                    obs.append(OrderedDict((k,v) for k,v in elem.attrib.items()))
                    elem.clear()
                elif elem.tag==self.nsString+'Series':
                    p_series=OrderedDict((k,v) for k,v in elem.attrib.items())               
                    elem.clear()
                    break          
            if self.nbIteration==self.nbseries:
                series=self.clean_field(self._build_series(group,p_series,obs))        
        except:
            self.file_handle.close()
            print('The iteration stopped because of an error!')
            raise StopIteration()
        
        if self.nbIteration!=self.nbseries:
            self.file_handle.close()
            print('The iteration is finished!')
            raise StopIteration()    
        return series
    
    def clean_field(self, bson):
        if not "start_ts" in bson or not bson.get("start_ts"):
            bson["start_ts"] = get_datetime_from_period(bson['start_date'], freq=bson["frequency"])
        if not "end_ts" in bson or not bson.get("end_ts"):
            bson["end_ts"] = get_datetime_from_period(bson['end_date'], freq=bson["frequency"])  
        return bson   
                        
    def _build_series(self,group,p_series,obs):
        dimensions=OrderedDict()
        attributes=OrderedDict()
        bson=OrderedDict() 
        dim=group.copy()
        dim.update(p_series) 
        attrib=defaultdict(list)
        
        dimension_keys=dim.keys()
        attribute_keys=[a for a in obs[0].keys() if a not in ['TIME_PERIOD','OBS_VALUE']]
        
        frequency,start_date,end_date=get_dates(dim,obs)
        self.dataset.add_frequency(frequency)
        
        values=list()
        for v in obs:
            period=v['TIME_PERIOD']
            a=OrderedDict()
            for k in attribute_keys:
                try:
                    a[k]=v[k]
                except KeyError:
                    a[k]=''
                attrib[k].append(a[k])
            value={ 'attributes': a,
                    'release_date': self.release_date,
                    'ordinal': get_ordinal_from_period(period,freq=frequency),
                    'period': period,
                    'value': v['OBS_VALUE']
                    }
            values.append(value)
        
        for key in dimension_keys:
            dimensions[key] = self.dimension_list.update_entry(key,dim[key],dim[key])
            if not key in self.dataset.codelists:
                self.dataset.codelists[key] = {}
            if not dimensions[key] in self.dataset.codelists[key]:
                self.dataset.codelists[key][dimensions[key]] = dimensions[key]
            
        for key in attribute_keys:
            try:
                attributes[key]=self.attribute_list.update_entry(key,str(attrib[key]),attrib[key])
            except KeyError:
                pass
            if not key in self.dataset.codelists:
                self.dataset.codelists[key] = {}
            if not attributes[key] in self.dataset.codelists[key]:
                self.dataset.codelists[key][str(attributes[key])] = attributes[key]
            
        
        series_name=dimensions['EXT_TITLE']
        series_key=self.nbseries
    
        bson['values'] = values                
        bson['provider_name'] = self.provider_name       
        bson['dataset_code'] = self.dataset_code
        bson['name'] = series_name
        bson['key'] = series_key
        bson['start_date'] = start_date
        bson['end_date'] = end_date  
        bson['last_update'] = self.release_date
        bson['dimensions'] = dimensions
        bson['frequency'] = frequency
        bson['attributes'] = attributes
        return bson 


'''Test'''
if __name__=="__main__":
    f=Fetcher(provider_name='BDF',is_indexes=False)
    dataset=Datasets(provider_name='BDF',
                     dataset_code='DET',
                     name='1234',
                     doc_href='http://webstat.banque-france.fr/fr/concepts.do?node=DATASETS',
                     last_update='20160603',
                     fetcher=f,
                     is_load_previous_version=False)

    iterator=BDF_Data(dataset,'http://webstat.banque-france.fr/fr/export.do?node=DATASETS_DET&exportType=sdmx')     
    for i in iterator:
        for key in i.keys():
            print(key,':',i[key])

                        
