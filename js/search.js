jQuery(function(){
	// Initalize lunr with fields it will search on. Title has 
	// a boost of 10 to indicate matches on it are more important.
	window.idx = lunr(function () {
		this.field('id');
		this.field('title', { boost: 10 });
		this.field('category');
	});

	// Download the data from the JSON file we generated
	window.data = $.getJSON('/docs/search_data.json');

	// Wait for the data to load and add it to lunr
	window.data.then(function(loaded_data){
		$.each(loaded_data, function(index, value){
			window.idx.add(
				$.extend({ "id": index }, value)
			);
		});
	});

	// Event when the form is submitted
	$("#site-search input").keyup(function(){
		event.preventDefault();
		var query = $("#site-search input").val(); // Get the value for the text field
		/*if(query.length < 3){
			return;
		}*/
		var results = window.idx.search(query); // Get lunr to perform a search
		display_search_results(results); // Hand the results off to be displayed
	});

	function display_search_results(results) {
		var $search_results = $("#search-results");
		// Wait for data to load
		window.data.then(function(loaded_data) {
			// Are there any results?
			if (results.length) {
				$search_results.empty(); // Clear any old results
				$search_results.toggle();
				// Iterate over the results
				results.forEach(function(result) {
					var item = loaded_data[result.ref];
					// Build a snippet of HTML for this result
					var appendString = '<li><a href="' + item.url + '">' + item.title + '</a></li>';
					// Add it to the results
					$search_results.append(appendString);
				});
			}
		});
	}
});
