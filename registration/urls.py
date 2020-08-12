from django.conf.urls import include, re_path
from . import views

urlpatterns = [
    re_path(r'^register_modal$', views.register_modal),
    re_path(r'^register$', views.register),
]