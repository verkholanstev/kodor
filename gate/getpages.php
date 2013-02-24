<?php
	//$res - response array

	$q = "SELECT `ID`, `NAME`, `URL` FROM `PAGES`";
	$result = mysql_query($q); // || die (mysql_error());

	$pages = array();
	while ($array = mysql_fetch_array($result)) {
		$pages[] = array("id" => $array["ID"], "name" => $array["NAME"], "url" => $array["URL"]);
	}

	$res["pages"] = $pages;
	$res["status"] = "OK";

?>