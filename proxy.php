<?php
	if (isset($_GET["page"]))
		$page = $_GET["page"];
	else
		$page = "index";
?>
<!DOCTYPE html>
<html>
	<head>
		<title>verkholantsev.ru</title>
		<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
		<script type="text/javascript" src="http://code.jquery.com/jquery-latest.js"></script>
		<script type="text/javascript" src="/build/kodor.js"></script>

		<!--Тестовые стили-->
        <link href="/bootstrap/css/bootstrap.min.css" rel="stylesheet" media="screen">
        <link rel="stylesheet" type="text/css" href="/style.css" />
        <link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,700italic,300,700,400&subset=latin,cyrillic,cyrillic-ext' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=PT+Sans+Narrow:400,700&subset=latin,cyrillic' rel='stylesheet' type='text/css'>
        <!-- Конец тестовых стилей-->

	</head>
	<body>
		
	</body>
	<script type="text/javascript">
	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-37721300-1']);
	  _gaq.push(['_trackPageview']);

	  (function() {
	    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();
	</script>
	<script type="text/javascript">
		 var kApp;
			$(document).ready(function() {
				kApp = new kodor.application({
					InitPage: "<?php echo $page; ?>"
				});
			});
	</script>
</html>