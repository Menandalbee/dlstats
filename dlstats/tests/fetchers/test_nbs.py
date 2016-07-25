# -*- coding: utf-8 -*-
"""
Created on Mon Jul 25 16:57:10 2016

@author: SHENGXI
"""

from nbs import NBS as Fetcher

from dlstats.tests.fetchers.base import BaseFetcherTestCase

DATA_AFAHF = {
    "DSD": {
        "filepath": None,
        "dataset_code": "AFAHF",
        "dsd_id": "AFAHF",
        "is_completed": True,
        "categories_key": "AFAHF",
        "categories_parents": ['NA', 'IOT', 'IUP'],
        "categories_root": ['NA'],

    }
}


class FetcherTestCase(BaseFetcherTestCase): 
    
    FETCHER_KLASS = Fetcher
    DATASETS = {
        'AFAHF':DATA_AFAHF,
    }
    DATASET_FIRST = 'AFAHF'
    DATASET_LAST = 'WRTHCS'
    DEBUG_MODE = False
    
    def test_build_data_tree(self):
        dataset_code = "AFAHF"
        self.assertDataTree(dataset_code)
