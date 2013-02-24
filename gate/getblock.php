<?php
	//$res - response array

	if(isset($req["Id"])) {
		$q = "SELECT `NAME`, `CONTENT`, `TEMPLATE`, `OWNERID` FROM `BLOCKS` WHERE `ID` = " . $req["Id"];
		$result = mysql_query($q); // || die (mysql_error());

		while ($array = mysql_fetch_array($result)) {
			if ($metabase["sessionOwner"] == $array["OWNERID"])
				$editable = true;
			else
				$editable = false;
			$block = array(
				"name" => $array["NAME"],
				"content" => $array["CONTENT"],
				"template" => $array["TEMPLATE"],
				"editable" => $editable
			);
		}

		$res["status"] = "OK";
		$res["block"] = $block;
	}
?>