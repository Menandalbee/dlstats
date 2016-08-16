# -*- coding: utf-8 -*-
"""
Created on Mon Jul 25 16:57:10 2016

@author: SHENGXI
"""
import os

import httpretty
import unittest

from dlstats.fetchers.nbs import NBS as Fetcher

from dlstats.tests.base import RESOURCES_DIR as BASE_RESOURCES_DIR
from dlstats.tests.fetchers.base import BaseFetcherTestCase

RESOURCES_DIR = os.path.abspath(os.path.join(BASE_RESOURCES_DIR, "nbs"))

def get_filepath(name):
    return os.path.abspath(os.path.join(RESOURCES_DIR, name))

DATA_GDP = {
    "filepath": get_filepath("GDP.xml"),
    "DSD": {
        "filepath": None,
        "dataset_code": "GDP",
        "dsd_id": "GDP",
        "is_completed": True,
        "categories_key": "NA.GDP",
        "categories_parents": ['NA'],
        "categories_root": ['NA'],
        "concept_keys": [
            'freq',
            'unit'
        ],
        "codelist_keys": [
            'freq',
            'unit'
        ],
        "codelist_count": {   
            'concept': 2,
        },                
        "dimension_keys": [
            'freq',
            'unit'
        ],
        "dimension_count": {
            'freq': 1,
            'unit': 2

        },
        "attribute_keys": None,
        "attribute_count": None
    },
    "series_accept": 6,
    "series_reject_frequency": 0,
    "series_reject_empty": 0,
    "series_all_values": 120,
    "series_key_first": "1",
    "series_key_last": "6",
    "series_sample": {
        'provider_name': 'NBS',
        'dataset_code': 'GDP',
        'key': '1',
        'name': "Gross National Income(100 million yuan)",
        'frequency': 'A',
        'last_update': None,
        'first_value': {
            'value': '60,356.6',
            'ordinal': 25,
            'period': '1995',
            'attributes': None
        },
        'last_value': {
            'value': '644,791.1',
            'ordinal': 44,
            'period': '2014',
            'attributes': None
        },
        'dimensions': {
            'unit': '100-million-yuan',
            'freq': 'a'
        },
        'attributes': None
    }    
}

DATA_CFAB_CD = {
    "filepath": None,
    "DSD": {
        "filepath": None,
        "dataset_code": "CFAB(CD)",
        "dsd_id": "GDP",
        "is_completed": True,
        "categories_key": "NA.BPA.B(CD)",
        "categories_parents": ['NA', "NA.BPA"],
        "categories_root": ['NA'],
        "concept_keys": [
            'freq',
            'unit'
        ],
        "codelist_keys": [
            'freq',
            'unit'
        ],
        "codelist_count": {   
            'concept': 2,
        },                
        "dimension_keys": [
            'freq',
            'unit'
        ],
        "dimension_count": {
            'freq': 1,
            'unit': 1

        },
        "attribute_keys": None,
        "attribute_count": None
    },
    "series_accept": 40,
    "series_reject_frequency": 0,
    "series_reject_empty": 0,
    "series_all_values": 800,
    "series_key_first": "1",
    "series_key_last": "40",
    "series_sample": {
        'provider_name': 'NBS',
        'dataset_code': 'CFAB(CD)',
        'key': '1',
        'name': "Capital and Finance Account Balance(Credit-Debit)(USD 10000)",
        'frequency': 'A',
        'last_update': None,
        'first_value': {
            'value': '3,867,500.00',
            'ordinal': 25,
            'period': '1995',
            'attributes': None
        },
        'last_value': {
            'value': '3,823,967.82',
            'ordinal': 44,
            'period': '2014',
            'attributes': None
        },
        'dimensions': {
            'unit': 'USD 10000',
            'freq': 'a'
        },
        'attributes': None
    }    
}

 

class FetcherTestCase(BaseFetcherTestCase): 
    
    # nosetests -s -v dlstats.tests.fetchers.test_nbs:FetcherTestCase
    
    FETCHER_KLASS = Fetcher
    DATASETS = {
        'GDP': DATA_GDP,
        'CFAB(CD)': DATA_CFAB_CD
    }
    DATASET_FIRST = 'AFAHF'
    DATASET_LAST = 'WRTHCS'
    DEBUG_MODE = False
       
    def _load_dataset_gdp(self):
        url = "http://data.stats.gov.cn/english/download.htm?ifNormal=true&type=xml&pdfWidth=1771&otherwds=%5B%7B%22wdname%22%3A%22Year%22%2C%22wdcode%22%3A%22sj%22%2C%22valuecode%22%3A%22LATEST20%22%7D%5D&tableData=%7B%22data%22%3A%22Indicators--2014--2013--2012--2011--2010--2009--2008--2007--2006--2005--2004--2003--2002--2001--2000--1999--1998--1997--1996--1995%23%23Gross+National+Income%28100+million+yuan%29--644%2C791.1--590%2C422.4--539%2C116.5--484%2C753.2--411%2C265.2--348%2C498.5--321%2C500.5--270%2C844.0--219%2C028.5--185%2C998.9--161%2C415.4--136%2C576.3--120%2C480.4--109%2C276.2--99%2C066.1--89%2C366.5--83%2C817.6--78%2C802.9--70%2C779.6--60%2C356.6%23%23Gross+Domestic+Product%28100+million+yuan%29--643%2C974.0--595%2C244.4--540%2C367.4--489%2C300.6--413%2C030.3--349%2C081.4--319%2C515.5--270%2C232.3--219%2C438.5--187%2C318.9--161%2C840.2--137%2C422.0--121%2C717.4--110%2C863.1--100%2C280.1--90%2C564.4--85%2C195.5--79%2C715.0--71%2C813.6--61%2C339.9%23%23Value-added+of+the+Primary+Industry%28100+million+yuan%29--58%2C343.5--55%2C329.1--50%2C902.3--46%2C163.1--39%2C362.6--34%2C161.8--32%2C753.2--27%2C788.0--23%2C317.0--21%2C806.7--20%2C904.3--16%2C970.2--16%2C190.2--15%2C502.5--14%2C717.4--14%2C549.0--14%2C618.7--14%2C265.2--13%2C878.3--12%2C020.5%23%23Value-added+of+the+Secondary+Industry%28100+million+yuan%29--277%2C571.8--261%2C956.1--244%2C643.3--227%2C038.8--191%2C629.8--160%2C171.7--149%2C956.6--126%2C633.6--104%2C361.8--88%2C084.4--74%2C286.9--62%2C697.4--54%2C105.5--49%2C660.7--45%2C664.8--41%2C080.9--39%2C018.5--37%2C546.0--33%2C828.1--28%2C677.5%23%23Value-added+of+the+Tertiary+Industry%28100+million+yuan%29--308%2C058.6--277%2C959.3--244%2C821.9--216%2C098.6--182%2C038.0--154%2C747.9--136%2C805.8--115%2C810.7--91%2C759.7--77%2C427.8--66%2C648.9--57%2C754.4--51%2C421.7--45%2C700.0--39%2C897.9--34%2C934.5--31%2C558.3--27%2C903.8--24%2C107.2--20%2C641.9%23%23Per+Capita+GDP%28yuan%29--47%2C203--43%2C852--40%2C007--36%2C403--30%2C876--26%2C222--24%2C121--20%2C505--16%2C738--14%2C368--12%2C487--10%2C666--9%2C506--8%2C717--7%2C942--7%2C229--6%2C860--6%2C481--5%2C898--5%2C091%23%23%22%2C%22title%22%3A%22Annual%22%2C%22dataSource%22%3A%22National+Bureau+of+Statistics%22%2C%22dbcode%22%3A%22Database%EF%BC%9AAnnual%22%2C%22rowcode%22%3A%22zb%22%2C%22colcode%22%3A%22sj%22%2C%22explain%22%3A%22Note%3A%22%7D&exps=%5B%7B%22dt%22%3A%221.%22%2C%22dd%22%3A%22Since+1980%2C+the+difference+between+the+Gross+Domestic+Product+and+the+Gross+National+Income+%28formerly%2C+the+Gross+National+Product%29+is+the+net+factor+income+from+the+rest+of+the+world.%22%7D%2C%7B%22dt%22%3A%222.%22%2C%22dd%22%3A%22The+classification+by+the+three+strata+of+industry+is+based+on+the+%E2%80%9CRegulation+on+the+Classification+by+Three+Strata+of+Industry%E2%80%9D+made+by+the+National+Bureau+of+Statistics+in+2012.+The+primary+industry+refers+to+agriculture%2C+forestry%2C+animal+husbandry+and+fishery+industries+%28except+support+services+to+agriculture%2C+forestry%2C+animal+husbandry+and+fishery+industries%29.+The+secondary+industry+refers+to+mining+%28except+auxiliary+activities+of+mining%29%2C+manufacturing+%28except+repairs+for+metal+products%2C+machinery+and+equipment%29%2C+production+and+supply+of+electricity%2C+steam%2C+gas+and+water%2C+and+construction.+The+tertiary+industry+refers+to+all+other+industries+not+included+in+primary+or+secondary+industry.%22%7D%2C%7B%22dt%22%3A%223.%22%2C%22dd%22%3A%22According+to+China%E2%80%99s+regulations+on+the+GDP+revisions+and+international+practice%2C+systematic+revisions+are+made+on+the+GDP+figures+for+2012+and+earlier+years+with+the+revised+2013+GDP+data+and+other+historical+data.+The+revisions+made+include+three+areas%3A+the+first+is+the+revision+of+the+GDP+figures+for+2012+and+earlier+years+following+the+revisions+of+the+National+Industrial+Classification+of+Economic+Activities+and+the+Classification+by+Three+Strata+of+Industry%3B+the+second+is+the+revision+of+the+GDP+figures+for+2009-2012+with+the+data+from+the+third+economic+census+available%3B+and+the+third+is+the+revision+of+the+value-added+of+financial+intermediation+for+2008+and+earlier+years+due+to+the+methodological+changes+in+calculating+the+value-added+of+financial+intermediation.%22%7D%5D"
        filepath = get_filepath('GDP.xml')
        self.assertTrue(os.path.exists(filepath))
        self.register_url(url, filepath, content_type='text/html')

    def _load_dataset_gdp_update(self):
        url = "http://data.stats.gov.cn/english/download.htm?ifNormal=true&type=xml&pdfWidth=1071&otherwds=%5B%7B%22wdname%22%3A%22Year%22%2C%22wdcode%22%3A%22sj%22%2C%22valuecode%22%3A%22LATEST10%22%7D%5D&tableData=%7B%22data%22%3A%22Indicators--2014--2013--2012--2011--2010--2009--2008--2007--2006--2005%23%23Gross+National+Income%28100+million+yuan%29--644%2C791.1--590%2C422.4--539%2C116.5--484%2C753.2--411%2C265.2--348%2C498.5--321%2C500.5--270%2C844.0--219%2C028.5--185%2C998.9%23%23Gross+Domestic+Product%28100+million+yuan%29--643%2C974.0--595%2C244.4--540%2C367.4--489%2C300.6--413%2C030.3--349%2C081.4--319%2C515.5--270%2C232.3--219%2C438.5--187%2C318.9%23%23Value-added+of+the+Primary+Industry%28100+million+yuan%29--58%2C343.5--55%2C329.1--50%2C902.3--46%2C163.1--39%2C362.6--34%2C161.8--32%2C753.2--27%2C788.0--23%2C317.0--21%2C806.7%23%23Value-added+of+the+Secondary+Industry%28100+million+yuan%29--277%2C571.8--261%2C956.1--244%2C643.3--227%2C038.8--191%2C629.8--160%2C171.7--149%2C956.6--126%2C633.6--104%2C361.8--88%2C084.4%23%23Value-added+of+the+Tertiary+Industry%28100+million+yuan%29--308%2C058.6--277%2C959.3--244%2C821.9--216%2C098.6--182%2C038.0--154%2C747.9--136%2C805.8--115%2C810.7--91%2C759.7--77%2C427.8%23%23Per+Capita+GDP%28yuan%29--47%2C203--43%2C852--40%2C007--36%2C403--30%2C876--26%2C222--24%2C121--20%2C505--16%2C738--14%2C368%23%23%22%2C%22title%22%3A%22Annual%22%2C%22dataSource%22%3A%22National+Bureau+of+Statistics%22%2C%22dbcode%22%3A%22Database%EF%BC%9AAnnual%22%2C%22rowcode%22%3A%22zb%22%2C%22colcode%22%3A%22sj%22%2C%22explain%22%3A%22Note%3A%22%7D&exps=%5B%7B%22dt%22%3A%221.%22%2C%22dd%22%3A%22Since+1980%2C+the+difference+between+the+Gross+Domestic+Product+and+the+Gross+National+Income+%28formerly%2C+the+Gross+National+Product%29+is+the+net+factor+income+from+the+rest+of+the+world.%22%7D%2C%7B%22dt%22%3A%222.%22%2C%22dd%22%3A%22The+classification+by+the+three+strata+of+industry+is+based+on+the+%E2%80%9CRegulation+on+the+Classification+by+Three+Strata+of+Industry%E2%80%9D+made+by+the+National+Bureau+of+Statistics+in+2012.+The+primary+industry+refers+to+agriculture%2C+forestry%2C+animal+husbandry+and+fishery+industries+%28except+support+services+to+agriculture%2C+forestry%2C+animal+husbandry+and+fishery+industries%29.+The+secondary+industry+refers+to+mining+%28except+auxiliary+activities+of+mining%29%2C+manufacturing+%28except+repairs+for+metal+products%2C+machinery+and+equipment%29%2C+production+and+supply+of+electricity%2C+steam%2C+gas+and+water%2C+and+construction.+The+tertiary+industry+refers+to+all+other+industries+not+included+in+primary+or+secondary+industry.%22%7D%2C%7B%22dt%22%3A%223.%22%2C%22dd%22%3A%22According+to+China%E2%80%99s+regulations+on+the+GDP+revisions+and+international+practice%2C+systematic+revisions+are+made+on+the+GDP+figures+for+2012+and+earlier+years+with+the+revised+2013+GDP+data+and+other+historical+data.+The+revisions+made+include+three+areas%3A+the+first+is+the+revision+of+the+GDP+figures+for+2012+and+earlier+years+following+the+revisions+of+the+National+Industrial+Classification+of+Economic+Activities+and+the+Classification+by+Three+Strata+of+Industry%3B+the+second+is+the+revision+of+the+GDP+figures+for+2009-2012+with+the+data+from+the+third+economic+census+available%3B+and+the+third+is+the+revision+of+the+value-added+of+financial+intermediation+for+2008+and+earlier+years+due+to+the+methodological+changes+in+calculating+the+value-added+of+financial+intermediation.%22%7D%5D"
        filepath = get_filepath("GDP_update.xml")
        self.assertTrue(os.path.exists(filepath))
        self.register_url(url, filepath, content_type='text/html')
    
    @httpretty.activate
    @unittest.skipUnless('FULL_TEST' in os.environ, 'Skip - no full test')
    def test_load_datasets_first(self):
        self._load_dataset_gdp()        
        dataset_code = "GDP"
        self.assertLoadDatasetsFirst([dataset_code])

    @httpretty.activate
    @unittest.skipUnless('FULL_TEST' in os.environ, 'Skip - no full test')
    def test_load_datasets_update(self):
        self._load_dataset_gdp_update()
        dataset_code = "GDP"
        self.assertLoadDatasetsFirst([dataset_code])        
    
     
    def test_build_data_tree(self):
        dataset_code = "GDP"
        self.assertDataTree(dataset_code)
  
    @httpretty.activate     
    def test_upsert_dataset_gdp(self): 
        
        # nosetests -s -v dlstats.tests.fetchers.test_nbs:FetcherTestCase.test_upsert_dataset_afahf
        
        dataset_code = "GDP"
        self._load_dataset_gdp()        
    
        self.assertProvider()
        self.assertDataset(dataset_code)        
        self.assertSeries(dataset_code)

    @unittest.skipUnless('FULL_TEST' in os.environ, 'Skip - no full test')     
    def test_upsert_dataset_cfab_cd(self): 
        '''Test of a dataset with a large url''' 
        
        # nosetests -s -v dlstats.tests.fetchers.test_nbs:FetcherTestCase.test_upsert_dataset_cfab_cd
        
        dataset_code = "CFAB(CD)"
    
        self.assertProvider()
        self.assertDataset(dataset_code)        
        self.assertSeries(dataset_code)   