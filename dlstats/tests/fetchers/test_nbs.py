# -*- coding: utf-8 -*-
"""
Created on Mon Jul 25 16:57:10 2016

@author: SHENGXI
"""
import os

import httpretty
import unittest

from nbs import NBS as Fetcher

from dlstats.tests.base import RESOURCES_DIR as BASE_RESOURCES_DIR
from dlstats.tests.fetchers.base import BaseFetcherTestCase

RESOURCES_DIR = os.path.abspath(os.path.join(BASE_RESOURCES_DIR, "nbs"))

def get_filepath(name):
    return os.path.abspath(os.path.join(RESOURCES_DIR, name))

INDEX_URL = "http://data.stats.gov.cn/english/easyquery.htm?cn=C01"

DATA_AFAHF = {
    "DSD": {
        "filepath": None,
        "dataset_code": "AFAHF",
        "dsd_id": "AFAHF",
        "is_completed": True,
        "categories_key": "NA.IOT.IUP",
        "categories_parents": ['NA', 'NA.IOT'],
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

    def _load_page_index(self):
        url = INDEX_URL
        filepath = get_filepath("NBS.html")
        self.assertTrue(os.path.exists(filepath))
        self.register_url(url, filepath, content_type='text/html')
        
    @httpretty.activate
    def test_build_data_tree(self):
        dataset_code = "AFAHF"
        self._load_page_index()
        self.assertDataTree(dataset_code)
