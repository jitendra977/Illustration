jQuery(document).ready(function($) {
    
    // ===========================
    // Admin Meta Box Cascading Dropdowns
    // ===========================
    
    // Load Car Models when Manufacturer is selected
    $('#manufacturer').on('change', function() {
        const manufacturerId = $(this).val();
        const $carModel = $('#car_model');
        const $engine = $('#engine_model');
        const $partCategory = $('#part_category');
        const $partSubcategory = $('#part_subcategory');
        
        // Reset dependent dropdowns
        $carModel.html('<option value="">Select Car Model</option>');
        $engine.html('<option value="">Select Engine</option>');
        $partCategory.html('<option value="">Select Part Category</option>');
        $partSubcategory.html('<option value="">Select Subcategory</option>');
        
        if(!manufacturerId) return;
        
        $carModel.html('<option value="">Loading...</option>');
        
        $.ajax({
            url: ajaxurl, // WordPress admin ajax URL
            type: 'POST',
            data: {
                action: 'get_car_models',
                manufacturer: manufacturerId,
                nonce: illustrationAdmin.nonce
            },
            success: function(response) {
                if(response.success && response.data.length > 0) {
                    let options = '<option value="">Select Car Model</option>';
                    response.data.forEach(function(item) {
                        options += '<option value="' + item.id + '">' + item.title + '</option>';
                    });
                    $carModel.html(options);
                } else {
                    $carModel.html('<option value="">No models available</option>');
                }
            },
            error: function() {
                $carModel.html('<option value="">Error loading models</option>');
            }
        });
    });
    
    // Load Engines when Car Model is selected
    $('#car_model').on('change', function() {
        const carModelId = $(this).val();
        const $engine = $('#engine_model');
        const $partCategory = $('#part_category');
        const $partSubcategory = $('#part_subcategory');
        
        $engine.html('<option value="">Select Engine</option>');
        $partCategory.html('<option value="">Select Part Category</option>');
        $partSubcategory.html('<option value="">Select Subcategory</option>');
        
        if(!carModelId) return;
        
        $engine.html('<option value="">Loading...</option>');
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'get_engines',
                car_model: carModelId,
                nonce: illustrationAdmin.nonce
            },
            success: function(response) {
                if(response.success && response.data.length > 0) {
                    let options = '<option value="">Select Engine</option>';
                    response.data.forEach(function(item) {
                        options += '<option value="' + item.id + '">' + item.title + '</option>';
                    });
                    $engine.html(options);
                } else {
                    $engine.html('<option value="">No engines available</option>');
                }
            },
            error: function() {
                $engine.html('<option value="">Error loading engines</option>');
            }
        });
    });
    
    // Load Part Categories when Engine is selected
    $('#engine_model').on('change', function() {
        const engineId = $(this).val();
        const $partCategory = $('#part_category');
        const $partSubcategory = $('#part_subcategory');
        
        $partCategory.html('<option value="">Select Part Category</option>');
        $partSubcategory.html('<option value="">Select Subcategory</option>');
        
        if(!engineId) return;
        
        $partCategory.html('<option value="">Loading...</option>');
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'get_parts',
                engine_model: engineId,
                nonce: illustrationAdmin.nonce
            },
            success: function(response) {
                if(response.success && response.data.length > 0) {
                    let options = '<option value="">Select Part Category</option>';
                    response.data.forEach(function(item) {
                        options += '<option value="' + item.id + '">' + item.title + '</option>';
                    });
                    $partCategory.html(options);
                } else {
                    $partCategory.html('<option value="">No categories available</option>');
                }
            },
            error: function() {
                $partCategory.html('<option value="">Error loading categories</option>');
            }
        });
    });
    
    // Load Part Subcategories when Part Category is selected
    $('#part_category').on('change', function() {
        const partId = $(this).val();
        const $partSubcategory = $('#part_subcategory');
        
        $partSubcategory.html('<option value="">Select Subcategory</option>');
        
        if(!partId) return;
        
        $partSubcategory.html('<option value="">Loading...</option>');
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'get_subparts',
                part_category: partId,
                nonce: illustrationAdmin.nonce
            },
            success: function(response) {
                if(response.success && response.data.length > 0) {
                    let options = '<option value="">Select Subcategory</option>';
                    response.data.forEach(function(item) {
                        options += '<option value="' + item.id + '">' + item.title + '</option>';
                    });
                    $partSubcategory.html(options);
                } else {
                    $partSubcategory.html('<option value="">No subcategories available</option>');
                }
            },
            error: function() {
                $partSubcategory.html('<option value="">Error loading subcategories</option>');
            }
        });
    });
    
    // Load existing relationships on page load
    if($('#manufacturer').val()) {
        loadExistingRelationships();
    }
    
    function loadExistingRelationships() {
        const manufacturerId = $('#manufacturer').val();
        const savedCarModel = $('#car_model').data('saved-value');
        const savedEngine = $('#engine_model').data('saved-value');
        const savedPart = $('#part_category').data('saved-value');
        const savedSubpart = $('#part_subcategory').data('saved-value');
        
        if(manufacturerId && savedCarModel) {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'get_car_models',
                    manufacturer: manufacturerId,
                    nonce: illustrationAdmin.nonce
                },
                success: function(response) {
                    if(response.success) {
                        let options = '<option value="">Select Car Model</option>';
                        response.data.forEach(function(item) {
                            const selected = item.id == savedCarModel ? ' selected' : '';
                            options += '<option value="' + item.id + '"' + selected + '>' + item.title + '</option>';
                        });
                        $('#car_model').html(options);
                        
                        if(savedEngine) {
                            $('#car_model').trigger('change');
                        }
                    }
                }
            });
        }
    }
    
});