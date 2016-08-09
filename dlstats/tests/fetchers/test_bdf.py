# -*- coding: utf-8 -*-
"""
Created on Mon May 23 16:42:04 2016

@author: SHENGXI
"""

import os
import datetime

from dlstats.fetchers.bdf import BDF as Fetcher

import httpretty
import unittest
from freezegun import freeze_time

from dlstats.tests.base import RESOURCES_DIR as BASE_RESOURCES_DIR
from dlstats.tests.fetchers.base import BaseFetcherTestCase


BDF_HTML_PAGES = [
    ("http://webstat.banque-france.fr/en/concepts.do?node=DATASETS", "WebstatBDF.html"),
    ("http://webstat.banque-france.fr/en/browseExplanation.do?node=DATASETS_AME", "AME_page_info.html")
]

RESOURCES_DIR = os.path.abspath(os.path.join(BASE_RESOURCES_DIR, "bdf"))

def get_filepath(name):
    return os.path.abspath(os.path.join(RESOURCES_DIR, name))

DATA_AME = {
    "filepath": get_filepath("AME.xml"),
    "DSD": {
        "filepath": None,
        "dataset_code": "AME",
        "dsd_id": "AME",
        "is_completed": True,
        "categories_key": "concept.AME",
        "categories_parents": ["concept"],
        "categories_root": ["concept"],
        "concept_keys": [
            'freq',
            'ame-ref-area',
            'ame-transformation',
            'ame-agg-method',
            'ame-unit',
            'ame-reference',
            'ame-item',
            'obs-status',
            'obs-conf'
        ],
        "codelist_keys": [
            'freq',
            'ame-ref-area',
            'ame-transformation',
            'ame-agg-method',
            'ame-unit',
            'ame-reference',
            'ame-item',
            'obs-status',
            'obs-conf'
        ],
        "codelist_count": {   
            "concept": 9,
        },                
        "dimension_keys": [
            'freq',
            'ame-ref-area',
            'ame-transformation',
            'ame-agg-method',
            'ame-unit',
            'ame-reference',
            'ame-item'
        ],
        "dimension_count": {
            "freq": 8,
            "ame-ref-area": 32,
            "ame-transformation": 1,
            "ame-agg-method": 1,
            "ame-unit": 5,
            "ame-reference": 1,
            "ame-item": 7
        },
        "attribute_keys": [
            'obs-status',
            'obs-conf'
        ],
        "attribute_count": {
            'obs-status': 2,
            'obs-conf':1
        }
    },
    "series_accept": 162,
    "series_reject_frequency": 0,
    "series_reject_empty": 0,
    "series_all_values": 7107,
    "series_key_first": "AME.A.AUT.1.0.212.0.HVGDP",
    "series_key_last": "AME.A.USA.1.0.99.0.UVGD",
    "series_sample": {
        'provider_name': 'BDF',
        'dataset_code': 'AME',
        'key': 'AME.A.AUT.1.0.212.0.HVGDP',
        'name': "Austria - Gross domestic product at current prices per head of population",
        'frequency': 'A',
        'last_update': None,
        'first_value': {
            'value': '1.08',
            'ordinal': -10,
            'period': '1960',
            'period_o': '1960',
            'attributes': {
                'obs-status': "A",
                'obs-conf': "F"
            },
        },
        'last_value': {
            'value': '37.49',
            'ordinal': 47,
            'period': '2017',
            'period_o': '2017',
            'attributes': {
                'obs-status': "A",
                'obs-conf': "F"
            },
        },
        'dimensions': {
            'freq':'a',
            'ame-ref_area':'aut',
            'ame-transformation':'1',
            'ame-agg-method':'0',
            'ame-unit':'212',
            'ame-reference':'0',
            'ame-item':'hvgdp'
        },
        'attributes': None
    }
}


class FetcherTestCase(BaseFetcherTestCase):

    # nosetests -s -v dlstats.tests.fetchers.test_bdf:FetcherTestCase
	
    FETCHER_KLASS = Fetcher
    DATASETS = {
        'AME':DATA_AME
    }
    DATASET_FIRST = 'AME'
    DATASET_LAST = 'TCN1'
    DEBUG_MODE = False
    
    def _load_files(self):
        for url, filename in BDF_HTML_PAGES:
            filepath = get_filepath(filename)
            self.assertTrue(os.path.exists(filepath))
            self.register_url(url, filepath, content_type='text/html')
        
    def _load_files_info_ame(self):
        url = "http://webstat.banque-france.fr/en/exportDsd.do?datasetId=167&datasetName=AME&keyFamily=BDF_AME1-Macro Economy&node=DATASETS_AME"     
        filepath = get_filepath('AME_info.xls')
        self.assertTrue(os.path.exists(filepath))
        self.register_url(url, filepath, content_type='text/html')
        
    def _load_files_dataset_ame(self):
        url = "http://webstat.banque-france.fr/en/export.do?node=DATASETS_AME&exportType=sdmx"
        self.register_url(url, self.DATASETS['AME']['filepath'], content_type='text/html')
		
    def _load_files_info_ecofi(self):
        url = "http://webstat.banque-france.fr/en/exportDsd.do?datasetId=189&datasetName=ECOFI&keyFamily=ECOFIN_DSD-EcoFin&node=DATASETS_ECOFI"
        filepath = get_filepath('ECOFI_info.xls')
        self.assertTrue(os.path.exists(filepath)) 
        self.register_url(url, filepath, content_type='text/html')
		
    def _load_files_dataset_ecofi_update(self):
        url1 = "http://webstat.banque-france.fr/en/export.do?node=UPDATES34381&exportType=sdmx"
        filepath = get_filepath('ECOFI_update.xml')
        self.assertTrue(os.path.exists(filepath))
        self.register_url(url1, filepath, content_type='text/html') 
                          
    @httpretty.activate
    @unittest.skipUnless('FULL_TEST' in os.environ, 'Skip-no full test')
    def test_load_datasets_first(self):
        dataset_code = 'AME'
        self._load_files()
        self._load_files_info_ame()
        self._load_files_dataset_ame()
        self.assertLoadDatasetsFirst([dataset_code])
        
    @httpretty.activate 
    @freeze_time("2016-07-06 00:00:01")    
    @unittest.skipUnless('FULL_TEST' in os.environ, "Skip - no full test")
    def test_load_datasets_update(self):
	
        dataset_code = 'ECOFI'
        
        url = "http://webstat.banque-france.fr/en/updates.do"
        self.register_url(url, get_filepath('Updates_page.html'), content_type='text/html')
        
        url = "http://webstat.banque-france.fr/en/browseExplanation.do?node=UPDATES34381"
        self.register_url(url, get_filepath('Update_ECOFI.html'), content_type='text/html') 
        
        self._load_files_info_ecofi()
        self._load_files_dataset_ecofi_update()
        self.assertLoadDatasetsUpdate([dataset_code])		

    @httpretty.activate     
    def test_build_data_tree(self):
        dataset_code = "AME"
        self._load_files()
        self.assertDataTree(dataset_code)
    
    @httpretty.activate     
    def test_upsert_dataset_ame(self):

		# nosetests -s -v dlstats.tests.fetchers.test_nbs:FetcherTestCase.test_upsert_dataset_ame
		
        dataset_code = "AME"
        self._load_files()
        self._load_files_info_ame()
        self._load_files_dataset_ame()
    
        self.assertProvider()
        self.assertDataset(dataset_code)        
        self.assertSeries(dataset_code)
		
    @httpretty.activate
    @freeze_time("2016-07-06")
    def test_parse_agenda(self):        
        model = [{'dataflow_key': 'EXR',
          'id': '34742',
          'name': 'Economic concepts – Exchange rate (39)',
          'url': "http://webstat.banque-france.fr/en/export.do?node=UPDATES34742&exportType=sdmx",
          'last_update': datetime.datetime(2016, 7, 5, 23, 59, 59)}]

        url = "http://webstat.banque-france.fr/en/updates.do"
        self.register_url(url, get_filepath('Updates_page.html'), content_type='text/html')
        
        url = "http://webstat.banque-france.fr/en/browseExplanation.do?node=UPDATES34742"
        self.register_url(url, get_filepath('Update_EXR.html'), content_type='text/html') 
		
        self.assertEqual(list(self.fetcher._parse_agenda())[-1], model[-1])