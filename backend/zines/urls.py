from django.urls import path
from .views import (
    ZineListCreateView, MyZinesView, ZineDetailView,
    TogglePrivacyView, UploadImageView, UpdateCellView
)

urlpatterns = [
    path('', ZineListCreateView.as_view(), name='zine-list-create'),
    path('mine/', MyZinesView.as_view(), name='my-zines'),
    path('<str:slug>/', ZineDetailView.as_view(), name='zine-detail'),
    path('<str:slug>/toggle-privacy/', TogglePrivacyView.as_view(), name='toggle-privacy'),
    path('<uuid:zine_id>/cell/<str:cell_key>/', UpdateCellView.as_view(), name='update-cell'),
    path('upload/image/', UploadImageView.as_view(), name='upload-image'),
]
