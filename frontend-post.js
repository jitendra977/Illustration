jQuery(document).ready(function($){

    $('#manufacturer').change(function(){
        var manufacturer = $(this).val();
        $.post(ajax_object.ajax_url, {action:'get_car_models', manufacturer:manufacturer}, function(data){
            $('#car_model').html(data);
            $('#engine_model').html('<option value="">Select Engine</option>');
            $('#part_category').html('<option value="">Select Part Category</option>');
            $('#part_subcategory').html('<option value="">Select Part Subcategory</option>');
        });
    });

    $('#car_model').change(function(){
        var car_model = $(this).val();
        $.post(ajax_object.ajax_url, {action:'get_engines', car_model:car_model}, function(data){
            $('#engine_model').html(data);
            $('#part_category').html('<option value="">Select Part Category</option>');
            $('#part_subcategory').html('<option value="">Select Part Subcategory</option>');
        });
    });

    $('#engine_model').change(function(){
        var engine = $(this).val();
        $.post(ajax_object.ajax_url, {action:'get_parts', engine_model:engine}, function(data){
            $('#part_category').html(data);
            $('#part_subcategory').html('<option value="">Select Subcategory</option>');
        });
    });

    $('#part_category').change(function(){
        var part = $(this).val();
        $.post(ajax_object.ajax_url, {action:'get_subparts', part_category:part}, function(data){
            $('#part_subcategory').html(data);
        });
    });

});