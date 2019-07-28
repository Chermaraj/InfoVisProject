"""
Definition of views.
"""

from datetime import datetime
from django.shortcuts import render
from django.http import HttpRequest
from VisualApp.models import CanadaDataTemp

def home(request):
    """Renders the home page."""
    stat_list = CanadaDataTemp.objects.filter(data_year='2019',data_month='2').values('stat_name')
    context = {
                'title':'Home Page',
                'year':datetime.now().year,
                "stationObject": stat_list,
                } 
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/index.html',context
    )
