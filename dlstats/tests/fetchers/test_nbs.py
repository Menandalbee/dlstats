# -*- coding: utf-8 -*-
"""
Created on Mon Jul 25 16:57:10 2016

@author: SHENGXI
"""

import vcr

from nbs import NBS as Fetcher

from dlstats.tests.fetchers.base import BaseFetcherTestCase

DATA_AFAHF = {
    "DSD": {
        "filepath": None,
        "dataset_code": "AFAHF",
        "dsd_id": "AFAHF",
        "is_completed": True,
        "categories_key": "NA.IOT.IUP.AFAHF",
        "categories_parents": ['NA', 'NA.IOT', 'NA.IOT.IUP'],
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
    
	@vcr.use_cassette()
    def test_build_data_tree(self):
        dataset_code = "AFAHF"
        self.assertDataTree(dataset_code)
