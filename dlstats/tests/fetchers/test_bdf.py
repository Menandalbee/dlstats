# -*- coding: utf-8 -*-
"""
Created on Mon May 23 16:42:04 2016

@author: SHENGXI
"""

import os

from bdf import BDF as Fetcher

import httpretty
import unittest

from dlstats.tests.base import RESOURCES_DIR as BASE_RESOURCES_DIR
from dlstats.tests.fetchers.base import BaseFetcherTestCase


BDF_HTML_PAGES = [
    ("http://webstat.banque-france.fr/en/concepts.do?node=DATASETS", "WebstatBDF.html"),
    ("http://webstat.banque-france.fr/en/browseExplanation.do?node=DATASETS_AME", "AME_page_info.html"),
    ("http://webstat.banque-france.fr/en/browseExplanation.do?node=DATASETS_DET", "DET_page_info.html")
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
        "categories_key": "AME",
        "categories_parents": ["concept"],
        "categories_root": [],
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
                'obs-value': "A",
                'obs-conf': "F"
            },
        },
        'last_value': {
            'value': '37.49',
            'ordinal': 47,
            'period': '2017',
            'period_o': '2017',
            'attributes': {
                'obs-value': "A",
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

DATA_DET = {
    "filepath": get_filepath("DET.xml"),
    "DSD": {
        "filepath": None,
        "dataset_code": "DET",
        "dsd_id": "DET",
        "is_completed": True,
        "categories_key": "DET",
        "categories_parents": ["concept"],
        "categories_root": [],
        "concept_keys": [
            'freq',
            'ref-area',
            'esa95-sector',
            'esa95-account',
            'mufa-valuation',
            'count-area',
            'data-type-bop',
            'esa95tp-denom',
            'obs-status',
            'obs-conf'
        ],
        "codelist_keys": [
            'freq',
            'ref-area',
            'esa95-sector',
            'esa95-account',
            'mufa-valuation',
            'count-area',
            'data-type-bop',
            'esa95tp-denom',
            'obs-status',
            'obs-conf'
        ],
        "codelist_count": {   
            "concept": 10,
        },                
        "dimension_keys": [
            'freq',
            'ref-area',
            'esa95-sector',
            'esa95-account',
            'mufa-valuation',
            'count-area',
            'data-type-bop',
            'esa95tp-denom',
        ],
        "dimension_count": {
            "freq": 8,
            "ref-area": 644,
            'esa95-sector': 29,
            'esa95-account': 22,
            'mufa-valuation': 4,
            'count-area': 644,
            'data-type-bop': 10,
            'esa95tp-denom': 33
        },
        "attribute_keys": [
            'obs-status',
            'obs-conf'
        ],
        "attribute_count": {
            'obs-status': 1,
            'obs-conf':1
        }
    },
    "series_accept": 4,
    "series_reject_frequency": 0,
    "series_reject_empty": 0,
    "series_all_values": 119,
    "series_key_first": "DET.A.FR.11C2.F51100.M.Z9.8.F",
    "series_key_last": "DET.A.FR.1315.F33200.M.Z9.8.F",
    "series_sample": {
        'provider_name': 'BDF',
        'dataset_code': 'DET',
        'key': 'DET.A.FR.11C2.F51100.M.Z9.8.F',
        'name': "Percentage of the capital of CAC 40 resident companies held by non-residents",
        'frequency': 'A',
        'last_update': None,
        'first_value': {
            'value': '36.0',
            'ordinal': 29,
            'period': '1999',
            'period_o': '1999',
            'attributes': {
                'obs-value': "A",
                'obs-conf': "F"
            },
        },
        'last_value': {
            'value': '45.3',
            'ordinal': 44,
            'period': '2014',
            'period_o': '2014',
            'attributes': {
                'obs-value': "A",
                'obs-conf': "F"
            },
        },
        'dimensions': {
            "freq": 8,
            "ref-area": 'fr',
            'esa95-sector': '11c2',
            'esa95-account': 'f51100',
            'mufa-valuation': 'm',
            'count-area': 'z9',
            'data-type-bop': '8',
            'esa95tp-denom': 'f'
        },
        'attributes': None
    }
}

class FetcherTestCase(BaseFetcherTestCase): 
    FETCHER_KLASS = Fetcher
    DATASETS = {
        'AME':DATA_AME,
        'DET':DATA_DET
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
                          
    @httpretty.activate
    @unittest.skipUnless('FULL_TEST' in os.environ, 'Skip-no full test')
    def test_load_datasets_first(self):
        dataset_code = 'AME'
        self._load_files()
        self._load_files_info_ame()
        self._load_files_dataset_ame()
        self.assertLoadDatasetsFirst([dataset_code])
        
    @httpretty.activate     
    @unittest.skipUnless('FULL_TEST' in os.environ, "Skip - no full test")
    def test_load_datasets_update(self):
        dataset_code = "AME"
        self._load_files()
        self._load_files_info_ame()
        self._load_files_dataset_ame()
        self.assertLoadDatasetsUpdate([dataset_code])

    @httpretty.activate     
    def test_build_data_tree(self):
        dataset_code = "AME"
        self._load_files()
        self.assertDataTree(dataset_code)
    
    @httpretty.activate     
    def test_upsert_dataset_ame(self):        
        dataset_code = "AME"
        self._load_files()
        self._load_files_info_ame()
        self._load_files_dataset_ame()
    
        self.assertProvider()
        self.assertDataset(dataset_code)        
        self.assertSeries(dataset_code)
    
    @httpretty.activate
    def test_upsert_dataset_det(self):
        dataset_code = 'DET'
        self._load_files()
        
        url_info = 'http://webstat.banque-france.fr/en/exportDsd.do?datasetId=156&datasetName=DET&keyFamily=BDF_DET1-Non-Resident Holdings of French Government Negociable Debt Securities&node=DATASETS_DET'
        self.register_url(url_info, get_filepath('DET_info.xls'), content_type='text/html')
        
        url = 'http://webstat.banque-france.fr/en/export.do?node=DATASETS_DET&exportType=sdmx'
        self.register_url(url, self.DATASETS[dataset_code]['filepath'], content_type='text/html')
        
        self.assertProvider()
        self.assertDataset(dataset_code)        
        self.assertSeries(dataset_code)