# -*- coding: utf-8 -*-
"""
Created on Mon May 23 16:42:04 2016

@author: SHENGXI
"""

#import pandas
#from lxml import etree
#from collections import defaultdict
#
#from dlstats.utils import Downloader, get_ordinal_from_period, make_store_path
#from dlstats.fetchers._commons import Fetcher, Datasets, Providers, Categories
#from XMLanalyse import BDF_Data
import re
from datetime import datetime
import os
from copy import deepcopy

from bdf import BDF as Fetcher
from dlstats import constants

import httpretty
import unittest

from dlstats.tests.base import RESOURCES_DIR as BASE_RESOURCES_DIR
from dlstats.tests.base import BaseTestCase
from dlstats.tests.fetchers.base import BaseFetcherTestCase
from dlstats.tests.resources import xml_samples

from unittest import mock

BDF_HTML_PAGES=[
    ('http://webstat.banque-france.fr/en/concepts.do?node=DATASETS','WebstatBDF.htm'),
    ('http://webstat.banque-france.fr/en/browseExplanation.do?node=DATASETS_AME','AME_page_explanation.htm')
]
#if __name__=="__main__":
#    f=Fetcher(provider_name='BDF',is_indexes=False)
#    dataset=Datasets(provider_name='BDF',
#                     dataset_code='AME',
#                     name='123',
#                     doc_href='http://webstat.banque-france.fr/fr/concepts.do?node=DATASETS',
#                     last_update='20160531',
#                     fetcher=f,
#                     is_load_previous_version=False)
#    iterator=BDF_Data(dataset,'http://webstat.banque-france.fr/fr/export.do?node=DATASETS_AME&exportType=sdmx')         


#class FethcerTestCase(BaseFetcherTestCase):

RESOURCES_DIR = os.path.abspath(os.path.join(BASE_RESOURCES_DIR, "bdf"))
def get_filepath(name):
    return os.path.abspath(os.path.join(RESOURCES_DIR,name))

DATA_AME={'filepath':get_filepath('AME.xml'),
           'DSD':{'categories_key':'AME',
                  'categories_parents':['concept'],
                  'categories_root':[],
                  'concept_keys':['freq',
                                  'ame-ref-area',
                                  'ame-transformation',
                                  'ame-agg-method',
                                  'ame-unit',
                                  'ame-reference',
                                  'ame-item',
                                  'obs-status',
                                  'obs-conf'],
                  'codelist_keys':['freq',
                                  'ame-ref-area',
                                  'ame-transformation',
                                  'ame-agg-method',
                                  'ame-unit',
                                  'ame-reference',
                                  'ame-item',
                                  'obs-status',
                                  'obs-conf'],
                  'codelist_count': {   
                      "concept": 9,
                  },                
                  "dimension_keys": ['freq',
                                  'ame-ref-area',
                                  'ame-transformation',
                                  'ame-agg-method',
                                  'ame-unit',
                                  'ame-reference',
                                  'ame-item'],
                  "dimension_count": {
                      'freq': 8,
                      'ame-ref-area': 32,
                      'ame-transformation': 1,
                      'ame-agg-method': 1,
                      'ame-unit': 5,
                      'ame-reference': 1,
                      'ame-item': 7
                  },
                  "attribute_keys": ['obs-status',
                                  'obs-conf'],
                  "attribute_count": {
                      'obs-status': 2,
                      'obs-conf':1
                  }
                 },
                 'series_accept': 162,
                 "series_reject_frequency": 0,
                 "series_reject_empty": 0,
                 "series_all_values": 7107,
                 "series_key_first": "1",
                 "series_key_last": "162",
                "series_sample": {
                    'provider_name': 'BDF',
                    'dataset_code': 'AME',
                    'key': '1',
                    'name': "Autriche, PIB par habitant en PPA",
                    'frequency': 'A',
                    'last_update': None,
                    'first_value': {
                        'value': '1.08',
                        'ordinal': -10,#-10
                        'period': '1960',
                        #'period_o': '1994',
                        'attributes': None,
                    },
                    'last_value': {
                        'value': '37.49',
                        'ordinal': 47,#20
                        'period': '2017',
                        #'period_o': '2014',
                        'attributes': None
                    },
                    'dimensions': {
                        'freq':'A',
                        'AME_REF_AREA':'AUT',
                        'AME_TRANSFORMATION':'1',
                        'AME_AGG_METHOD':'0',
                        'AME_UNIT':'212',
                        'AME_REFERENCE':'0',
                        'AME_ITEM':'HVGDP',
                    },
                    'attributes': None
                }
}
DATA_TCN1={'filepath':get_filepath('TCN1'),
           'DSD':{'categories_key':'TCN1',
                  'categories_parents':['concept'],
                  'categories_root':[],
                  'concept_keys':None}}

class FetcherTestCase(BaseFetcherTestCase): 
    FETCHER_KLASS=Fetcher
    DATASETS={
        'AME':DATA_AME,
        'TCN1':DATA_TCN1
        }
    DATASET_FIRST='AME'
    DATASET_LAST='TCN1'
    DEBUG_MODE=False
    
    def _load_files(self,dataset_code=None):
        for url, filename in BDF_HTML_PAGES:
            filepath=get_filepath(filename)
            self.assertTrue(os.path.exists(filepath))
            self.register_url(url, filepath, content_type='text/html')
        
    def _load_files_info_ame(self,dataset_code=None):
        url = "http://webstat.banque-france.fr/en/exportDsd.do?datasetId=167&datasetName=AME&keyFamily=BDF_AME1-Macro Economy&node=DATASETS_AME"     
        filepath = get_filepath('AME_info.xls')
        self.assertTrue(os.path.exists(filepath))
        self.register_url(url, filepath, content_type='text/html')
        
    def _load_files_dataset_ame(self):
        url = "http://webstat.banque-france.fr/en/export.do?node=DATASETS_AME&exportType=sdmx"
        self.register_url(url, self.DATASETS['AME']['filepath'], content_type='text/html')

    @httpretty.activate     
    def test_build_data_tree(self):
        dataset_code = "AME"
        self._load_files(dataset_code)
        self.assertDataTree(dataset_code)
    
    @httpretty.activate     
    def test_upsert_dataset_ame(self):        
        dataset_code = "AME"
        self._load_files(dataset_code)
        self._load_files_info_ame(dataset_code)
        self._load_files_dataset_ame()
    
        self.assertProvider()
        self.assertDataset(dataset_code)        
        self.assertSeries(dataset_code)
       