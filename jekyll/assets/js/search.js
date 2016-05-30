---
---

jQuery(function(){
	// Initalize lunr with fields it will search on. Title has
	// a boost of 10 to indicate matches on it are more important.
	window.idx = lunr(function () {
		this.field('id');
		this.field('title', { boost: 20 });
		this.field('category', { boost: 10 });
		this.field('url', { boost: 5 });
		this.field('content');
	});

	// Download the data from the JSON file we generated
	window.data = $.getJSON('{{ site.baseurl }}/assets/js/search-index.json');

	// Wait for the data to load and add it to lunr
	window.data.then(function(loaded_data){
		$.each(loaded_data, function(index, value){
			window.idx.add(
				$.extend({ "id": index }, value)
			);
		});
	});

	$("#site-search").submit(function(event){
		event.preventDefault(); // disable submitting by clicking enter
	});

	// Event when the form is submitted
	$("#site-search input").keyup(function(event){
		event.preventDefault();

		var query = $("#site-search input").val(); // Get the value for the text field
		var $search_results = $("#search-results");

		if(query.length < 3){
			$search_results.toggle(false);
			return;
		}

		var results = window.idx.search(query); // Get lunr to perform a search
		display_search_results(results, $search_results); // Hand the results off to be displayed
	});

	function display_search_results(results, $search_results) {
		// Wait for data to load
		window.data.then(function(loaded_data) {
			// Are there any results?
			if (results.length) {
				$search_results.empty(); // Clear any old results
				$search_results.toggle(true);
				// Iterate over the results
				results.forEach(function(result) {
					var item = loaded_data[result.ref];
					// Build a snippet of HTML for this result
					var appendString = '<li><a href="' + item.url + '">' + item.title + '</a></li>';
					// Add it to the results
					$search_results.append(appendString);
				});
			}else{
				$search_results.empty();
				$search_results.append('<li><span>No results found</span></li>');
			}
		});
	}
});
