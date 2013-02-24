<?php
	//$res[...] - Response Array
	
	if(isset($req["Id"])) {
		$q = "SELECT `OWNERID` FROM `BLOCKS` WHERE `ID` = " . $req["Id"];
		$result = mysql_query($q); // || die (mysql_error());
		while ($arr = mysql_fetch_array($result)) {
			if ($metabase["sessionOwner"] == $arr["OWNERID"])
				$editable = true;
			else
				$editable = false;
			$block = array(
				"editable" => $editable
				);

			$res["status"] = "OK";
			$res["block"] = $block;
		}
	}
	else {
		$res["status"] = "ERROR";
		$res["error"] = "NOID";
	}
?>