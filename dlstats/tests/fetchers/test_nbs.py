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

DATA_AFAHF = {
    "filepath": get_filepath("AFAHF.xml"),
    "DSD": {
        "filepath": None,
        "dataset_code": "AFAHF",
        "dsd_id": "AFAHF",
        "is_completed": True,
        "categories_key": "NA.IOT.IUP",
        "categories_parents": ['NA', 'NA.IOT'],
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
    "series_accept": 24,
    "series_reject_frequency": 0,
    "series_reject_empty": 0,
    "series_all_values": 480,
    "series_key_first": "1",
    "series_key_last": "24",
    "series_sample": {
        'provider_name': 'NBS',
        'dataset_code': 'AFAHF',
        'key': '1',
        'name': "Total Inputs, Agriculture, Forestry, Animal Husbandry and Fishery(10000 yuan)",
        'frequency': 'A',
        'last_update': None,
        'first_value': {
            'value': '',
            'ordinal': 25,
            'period': '1995',
            'attributes': None
        },
        'last_value': {
            'value': '',
            'ordinal': 44,
            'period': '2014',
            'attributes': None
        },
        'dimensions': {
            'unit': '10000-yuan',
            'freq': 'a'
        },
        'attributes': None
    }    
}

 

class FetcherTestCase(BaseFetcherTestCase): 
    
    # nosetests -s -v dlstats.tests.fetchers.test_nbs:FetcherTestCase
    
    FETCHER_KLASS = Fetcher
    DATASETS = {
        'AFAHF':DATA_AFAHF,
    }
    DATASET_FIRST = 'AFAHF'
    DATASET_LAST = 'WRTHCS'
    DEBUG_MODE = False
       
    def _load_dataset_afahf(self):
        url = "http://data.stats.gov.cn/english/download.htm?ifNormal=true&type=xml&pdfWidth=1861&otherwds=%5B%7B%22wdname%22%3A%22Year%22%2C%22wdcode%22%3A%22sj%22%2C%22valuecode%22%3A%22LATEST20%22%7D%5D&tableData=%7B%22data%22%3A%22Indicators--2014--2013--2012--2011--2010--2009--2008--2007--2006--2005--2004--2003--2002--2001--2000--1999--1998--1997--1996--1995%23%23Total+Inputs%2C+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2810000+yuan%29--empty--empty--894%2C213%2C473.19--empty--693%2C198%2C000.00--empty--empty--488%2C929%2C999.91--empty--393%2C566%2C962.50--empty--empty--285%2C787%2C422.99--empty--264%2C482%2C669.86--empty--empty--246%2C773%2C827.00--empty--empty%23%23Intermediate+Use%2C+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2810000+yuan%29--empty--empty--370%2C625%2C314.01--empty--287%2C862%2C000.00--empty--empty--202%2C338%2C262.21--empty--162%2C757%2C603.90--empty--empty--119%2C482%2C762.05--empty--111%2C522%2C265.08--empty--empty--99%2C357%2C988.11--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2810000+yuan%29--empty--empty--123%2C205%2C603.45--empty--92%2C202%2C499.58--empty--empty--68%2C771%2C565.47--empty--61%2C717%2C615.20--empty--empty--46%2C368%2C195.59--empty--40%2C355%2C500.00--empty--empty--39%2C641%2C456.43--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Mining%2810000+yuan%29--empty--empty--59%2C549.21--empty--562%2C009.48--empty--empty--330%2C853.56--empty--1%2C699%2C349.54--empty--empty--980%2C424.62--empty--439%2C177.30--empty--empty--512%2C276.06--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Manufacture+of+Foods%2C+Beverage+and+Tobacco%2810000+yuan%29--empty--empty--94%2C118%2C243.54--empty--71%2C246%2C063.52--empty--empty--47%2C022%2C865.06--empty--27%2C383%2C558.36--empty--empty--15%2C717%2C459.67--empty--15%2C108%2C300.00--empty--empty--16%2C368%2C977.33--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Manufacture+of+Textile%2C+Wearing+Apparel+and+Leather+Products%2810000+yuan%29--empty--empty--397%2C114.61--empty--362%2C264.72--empty--empty--271%2C598.96--empty--336%2C761.59--empty--empty--213%2C489.74--empty--797%2C955.00--empty--empty--706%2C277.28--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Other+Manufacture%2810000+yuan%29--empty--empty--669%2C336.19--empty--2%2C004%2C176.69--empty--empty--1%2C469%2C214.68--empty--1%2C857%2C791.73--empty--empty--1%2C614%2C620.88--empty--818%2C887.40--empty--empty--1%2C043%2C260.08--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Production+and+Supply+of+Electric+Power%2C+Heat+Power+and+Water%2810000+yuan%29--empty--empty--8%2C920%2C335.71--empty--7%2C092%2C896.40--empty--empty--4%2C673%2C773.97--empty--4%2C339%2C453.05--empty--empty--3%2C310%2C202.54--empty--3%2C065%2C830.00--empty--empty--1%2C805%2C192.51--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Coking%2C+Gas+and+Processing+of+Petroleum%2810000+yuan%29--empty--empty--14%2C499%2C087.94--empty--4%2C900%2C755.00--empty--empty--3%2C961%2C123.98--empty--4%2C188%2C809.70--empty--empty--2%2C814%2C691.71--empty--3%2C703%2C100.00--empty--empty--2%2C088%2C501.38--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Chemical+Industry%2810000+yuan%29--empty--empty--75%2C796%2C652.03--empty--54%2C421%2C113.82--empty--empty--37%2C291%2C505.94--empty--25%2C982%2C159.97--empty--empty--19%2C248%2C702.06--empty--24%2C747%2C300.00--empty--empty--18%2C257%2C171.51--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Manufacture+of+Nonmetallic+Mineral+Products%2810000+yuan%29--empty--empty--289%2C937.83--empty--987%2C155.90--empty--empty--692%2C876.99--empty--1%2C179%2C405.46--empty--empty--900%2C993.81--empty--509%2C764.00--empty--empty--627%2C725.35--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Manufacture+and+Processing+of+Metals+and+Metal+Products%2810000+yuan%29--empty--empty--429%2C625.37--empty--2%2C363%2C358.52--empty--empty--1%2C458%2C964.19--empty--1%2C425%2C315.86--empty--empty--1%2C162%2C704.42--empty--723%2C665.80--empty--empty--768%2C793.07--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Manufacture+of+Machinery+and+Equipment%2810000+yuan%29--empty--empty--7%2C309%2C381.93--empty--6%2C761%2C072.14--empty--empty--5%2C310%2C450.21--empty--4%2C530%2C911.91--empty--empty--3%2C964%2C841.28--empty--4%2C241%2C720.20--empty--empty--3%2C947%2C123.37--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Construction%2810000+yuan%29--empty--empty--81%2C428.09--empty--172%2C743.70--empty--empty--113%2C271.45--empty--746%2C537.65--empty--empty--497%2C113.21--empty--569%2C970.00--empty--empty--489%2C537.81--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Transport%2C+Storage%2C+Post%2C+Information+Transmission%2C+Computer+Services+and+Software%2810000+yuan%29--empty--empty--11%2C724%2C430.00--empty--15%2C487%2C695.54--empty--empty--9%2C707%2C947.25--empty--9%2C132%2C506.08--empty--empty--6%2C152%2C180.20--empty--3%2C689%2C724.00--empty--empty--2%2C938%2C150.38--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Wholesale+and+Retail+Trades%2C+Hotels+and+Catering+Services%2810000+yuan%29--empty--empty--13%2C979%2C197.71--empty--11%2C376%2C971.37--empty--empty--8%2C517%2C007.89--empty--8%2C615%2C858.14--empty--empty--7%2C957%2C969.72--empty--5%2C026%2C066.00--empty--empty--4%2C474%2C911.54--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Real+Estate%2C+Leasing+and+Business+Services%2810000+yuan%29--empty--empty--320%2C135.16--empty--1%2C170%2C581.78--empty--empty--818%2C680.59--empty--1%2C003%2C741.11--empty--empty--1%2C194%2C940.62--empty--1%2C405%2C699.60--empty--empty--1%2C084%2C031.26--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Financial+Intermediation%2810000+yuan%29--empty--empty--11%2C048%2C752.17--empty--5%2C514%2C421.04--empty--empty--4%2C063%2C621.63--empty--4%2C143%2C830.81--empty--empty--4%2C513%2C873.14--empty--1%2C522%2C460.00--empty--empty--1%2C157%2C123.47--empty--empty%23%23Intermediate+Use+for+Agriculture%2C+Forestry%2C+Animal+Husbandry+and+Fishery%2C+by+Other+Services%2810000+yuan%29--empty--empty--7%2C776%2C503.05--empty--11%2C236%2C220.80--empty--empty--7%2C862%2C940.41--empty--4%2C473%2C997.74--empty--empty--2%2C870%2C358.86--empty--4%2C797%2C145.78--empty--empty--3%2C447%2C479.28--empty--empty%23%23Value-added+of+Agriculture%2C+Forestry%2C+Animal+Husbandry%2810000+yuan%29--empty--empty--523%2C588%2C159.18--empty--405%2C336%2C000.00--empty--empty--286%2C591%2C737.69--empty--230%2C809%2C358.60--empty--empty--166%2C304%2C660.93--empty--152%2C960%2C404.78--empty--empty--147%2C415%2C838.89--empty--empty%23%23Depreciation+of+Fixed+Assets%2C+Agriculture%2C+Forestry%2C+Animal+Husbandry%2810000+yuan%29--empty--empty--22%2C581%2C542.18--empty--18%2C924%2C174.39--empty--empty--14%2C297%2C447.67--empty--11%2C945%2C295.20--empty--empty--7%2C649%2C132.10--empty--5%2C968%2C377.22--empty--empty--5%2C847%2C862.40--empty--empty%23%23Compensation+of+Employees%2C+Agriculture%2C+Forestry%2C+Animal+Husbandry%2810000+yuan%29--empty--empty--529%2C963%2C185.76--empty--385%2C628%2C325.61--empty--empty--271%2C816%2C270.02--empty--208%2C972%2C657.30--empty--empty--133%2C159%2C686.50--empty--134%2C431%2C208.14--empty--empty--129%2C786%2C622.47--empty--empty%23%23Net+Taxes+on+Production%2C+Agriculture%2C+Forestry%2C+Animal+Husbandry%2810000+yuan%29--empty--empty---28%2C956%2C568.77--empty--783%2C500.00--empty--empty--478%2C020.00--empty--1%2C209%2C199.22--empty--empty--5%2C446%2C504.27--empty--4%2C150%2C515.69--empty--empty--4%2C329%2C970.10--empty--empty%23%23Operating+Surplus%2C+Agriculture%2C+Forestry%2C+Animal+Husbandry%2810000+yuan%29--empty--empty--empty--empty--empty--empty--empty--empty--empty--8%2C682%2C206.88--empty--empty--20%2C049%2C338.08--empty--8%2C410%2C303.73--empty--empty--7%2C451%2C383.93--empty--empty%23%23%22%2C%22title%22%3A%22Annual%22%2C%22dataSource%22%3A%22National+Bureau+of+Statistics%22%2C%22dbcode%22%3A%22Database%EF%BC%9AAnnual%22%2C%22rowcode%22%3A%22zb%22%2C%22colcode%22%3A%22sj%22%2C%22explain%22%3A%22%22%7D&exps=%5B%5D"
        filepath = get_filepath('AFAHF.xml')
        self.assertTrue(os.path.exists(filepath))
        self.register_url(url, filepath, content_type='text/html')
                              
    @httpretty.activate
    @unittest.skipUnless('FULL_TEST' in os.environ, 'Skip - no full test')
    def test_load_datasets_first(self):
        self._load_files_info_afahf()        
        dataset_code = 'AFAHF'
        self.assertLoadDatasetsFirst([dataset_code])

    @httpretty.activate     
    def test_build_data_tree(self):
        dataset_code = "AFAHF"
        self.assertDataTree(dataset_code)
  
    @httpretty.activate     
    def test_upsert_dataset_afahf(self): 
        
        # nosetests -s -v dlstats.tests.fetchers.test_nbs:FetcherTestCase.test_upsert_dataset_afahf
        
        dataset_code = "AFAHF"
        self._load_dataset_afahf()
    
        self.assertProvider()
        self.assertDataset(dataset_code)        
        self.assertSeries(dataset_code)
    