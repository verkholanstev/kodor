<?php
	//$res - response array
	if (isset($req["Name"])) {
		$n = $req["Name"]; //CHECK INJECTION!!!
		$q = "SELECT `NAME`, `URL`, `PAGETEMPLATES`.`TEMPLATE` AS `TEMPLATE`, `PAGES`.`CONTENT` AS `CONTENT` FROM `PAGES`
			LEFT JOIN `PAGETEMPLATES` ON `PAGES`.`TEMPLATEID` = `PAGETEMPLATES`.`ID`
			WHERE `PAGES`.`NAME` = '" . $n . "'";
		
		$result = mysql_query($q);
		$pageExists = false;
		$page = array();
		while ($arr = mysql_fetch_array($result)) {
			$pageExists = true;
			$page = array(
				"name" => $arr["NAME"],
				"url" => $arr["URL"],
				"template" => $arr["TEMPLATE"],
				"content" => $arr["CONTENT"],
			);
		}
		$res["page"] = $page;

		if ($pageExists)
			$res["status"] = "OK";
		else
			$res["status"] = "NOPAGE";

	}

	if (isset($req["Id"])) {
		$q = "SELECT `ID`, `NAME` FROM `BLOCKS` WHERE `PAGEID` = " . $req["Id"];
		$result = mysql_query($q); // || die (mysql_error());
		$blocks = array();
		while ($array = mysql_fetch_array($result)) {
			$blocks[] = array(
				"id" => $array["ID"],
				"name" => $array["NAME"]
			);
		}

		$q = "SELECT `NAME`, `URL`, `TEMPLATE` FROM `PAGES` WHERE `ID` = '" . $req["Id"] . "'";
		$result = mysql_query($q);// || die (mysql_error());

		$page = array();
		while ($array = mysql_fetch_array($result)) {
			$page = array(
				"name" => $array["NAME"], 
				"url" => $array["URL"], 
				"template" => $array["TEMPLATE"],
				"content" => $blocks
			);
		}
		
		$res["page"] = $page;
	}
?>