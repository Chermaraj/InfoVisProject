"""
Definition of urls for InfoVisProject.
"""

from datetime import datetime
from django.conf.urls import include,url
from django.contrib.auth.views import LoginView, LogoutView
from VisualApp import forms, views


urlpatterns = [
    url(r'^$',views.home, name='home'),
    url(r'^canada_climate', views.climate, name='climate')
]
