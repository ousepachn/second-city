# -*- coding: utf-8 -*-
"""
Created on Thu May  3 12:27:09 2018

@author: JosephChacko
"""

from bs4 import BeautifulSoup
import urllib3
import json
import pandas as pd
import os
import re
from time import sleep
import pickle
from sklearn import linear_model
import statsmodels.api as sm
import matplotlib.pyplot as plt

os.chdir('C:\\Users\\ousep\\Documents\\DataVisualizationBlog\\second-city')

http=urllib3.PoolManager()

url='http://www.skyscrapercenter.com/compare-data/submit?base_city=1539&base_company=All&base_height_range=0&base_max_year=9999&base_min_year=1900&output%5B%5D=list&skip_comparison=on&status%5B%5D=COM&status%5B%5D=PRO&status%5B%5D=STO&status%5B%5D=UC&status%5B%5D=UCT&type%5B%5D=building'
response=http.request('GET',url)
content=urllib3.urlopen(url).read()
soup=BeautifulSoup(response.data)
scripts=soup.findAll('script', type='text/javascript')


x=scripts[2].text
y=x[x.find('['):x.rfind(']')+1]
X=json.loads(x[x.find('['):x.rfind(']')+1])
df=pd.DataFrame.from_dict(X)

with open('chicago_skyscrapers.txt','w') as f:
    f.write(y)
    
df.to_excel('chicago_buildings.xlsx')


details=[]
for val in df['url']:
    url='http://www.skyscrapercenter.com'+val
    print(url)
    response=http.request('GET',url)
    soup=BeautifulSoup(response.data)
    tables=soup.findAll('table',{"class":"table table-condensed table-building-data"})
    companies=[val]
    for row in tables[len(tables)-1].findAll('tr'):
        for datum in row.findAll('td'):
            companies.append(re.sub(r'\t|\n|\r','',datum.text.strip()))
    print(companies)
    details.append(companies)
    sleep(1)

df['details']=details

x=0
Architects=[]
for val in details:
#    print (val)
    try:
        i=val.index('Architect')
#        print (val[i+1],' : ', val[i+2])
        Architects.append(val[i+2])
    except ValueError:
        Architects.append('N/A')


df['Architect']=Architects


    
df2=df.convert_objects(convert_numeric=True)

df2.to_pickle('df2.pck')
df.to_pickle('df.pck')

df2=pd.read_pickle('df2.pck')

details=df2['details']

df2['time']=df2['completed']-df2['start']

sum(df2['time'].isnull())

df2.plot.scatter('floors_above','time')


################
#modelling
df2.columns
df2['c_1900']=df2['completed']-1900
X=df2[['floors_above','c_1900']]
y=df2['time']*12

X=sm.add_constant(X)

est=sm.OLS(y,X,missing='drop').fit()

est.summary()

plt.scatter(X['c_1900'],X['floors_above'])
