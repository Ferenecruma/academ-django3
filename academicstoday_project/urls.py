from django.urls import include, path
from django.contrib import admin
from django.conf.urls.static import static, settings

urlpatterns = [
    # Examples:
    # url(r'^$', 'academicstoday_project.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    path('admin/', admin.site.urls),
               
    # This regex makes the default URL for the website to launch this view.
    path(r'', include('landpage.urls')),
    path(r'', include('registration.urls')),
    path(r'', include('login.urls')),
    path(r'', include('account.urls')),
    path(r'', include('registrar.urls')),
    path(r'', include('student.urls')),
    path(r'', include('teacher.urls')),
    path(r'', include('publisher.urls')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
