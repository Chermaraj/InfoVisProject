"""
Definition of views.
"""

from datetime import datetime
from django.shortcuts import render
from django.http import HttpRequest
from django.http import JsonResponse
from VisualApp.models import CanadaAggData
import json
from django.core.serializers.json import DjangoJSONEncoder

stat_list = CanadaAggData.objects.values('data_year', 'data_month','month_label','season', 'stat_n_month', 'stat_n_year', 'stat_n_season', 'month_avg_precip',
                                        'season_avg_precip', 'year_avg_precip', 'province_name')

def home(request):
    """Renders the home page."""

    climate_jsonObjects = []
    for info in stat_list:
        climate_jsonObjects.append(info)
    climate_jsonObjects = json.dumps(climate_jsonObjects, cls=DjangoJSONEncoder)
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


def climate(request):
    print("Entered")
    climate_jsonObjects = []
    for info in stat_list:
        climate_jsonObjects.append(info)
    climate_jsonObjects = json.dumps(climate_jsonObjects, cls=DjangoJSONEncoder)
    print("Ended")                                                                                                                                                                                                                                                              
    return JsonResponse(list(stat_list),safe =False)