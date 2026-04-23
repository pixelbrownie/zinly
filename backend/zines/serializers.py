from rest_framework import serializers
from .models import Zine, ZineCell
from users.serializers import UserSerializer


class ZineCellSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZineCell
        fields = [
            'id', 'cell_key', 'image_url', 'cloudinary_public_id',
            'text_content', 'text_color', 'font_size', 'bg_color'
        ]
        read_only_fields = ['id']


class ZineSerializer(serializers.ModelSerializer):
    cells = ZineCellSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Zine
        fields = [
            'id', 'owner', 'title', 'slug', 'description',
            'is_public', 'cover_image_url', 'theme_color',
            'cells', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'owner', 'created_at', 'updated_at']


class ZineCreateSerializer(serializers.ModelSerializer):
    cells = ZineCellSerializer(many=True, required=False)

    class Meta:
        model = Zine
        fields = ['title', 'description', 'is_public', 'theme_color', 'cells']

    def create(self, validated_data):
        cells_data = validated_data.pop('cells', [])
        zine = Zine.objects.create(**validated_data)

        # Create default 8 cells if none provided
        if not cells_data:
            cell_keys = ['cover', 'back', 'page1', 'page2', 'page3', 'page4', 'page5', 'page6']
            for key in cell_keys:
                ZineCell.objects.create(zine=zine, cell_key=key)
        else:
            for cell_data in cells_data:
                ZineCell.objects.create(zine=zine, **cell_data)

        return zine

    def update(self, instance, validated_data):
        cells_data = validated_data.pop('cells', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if cells_data is not None:
            for cell_data in cells_data:
                cell_key = cell_data.get('cell_key')
                if cell_key:
                    ZineCell.objects.filter(
                        zine=instance, cell_key=cell_key
                    ).update(**{k: v for k, v in cell_data.items() if k != 'cell_key'})

        return instance
