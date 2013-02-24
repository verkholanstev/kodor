<?php
	//$res - response array

	if(isset($req["Id"]) && isset($req["Content"])) {

		if ($metabase["htmlAllowed"] == 0) {
			$allowedTags = array("<b>", "</b>", "<i>", "</i>", "<h4>", "</h4>", "<br>", "<p>", "</p>");
			$cutContent = str_replace($allowedTags, "", $req["Content"]);
			$hasLt = strpos($cutContent, "<");
			$hasGt = strpos($cutContent, ">");
			//echo $cutContent;
			if ($hasLt !== false || $hasGt !== false) {
				die(json_encode(array(
					"status" => "ERROR",
					"message" => "HTML is not allowed"
					)));
			}
		}

		$q = "SELECT `OWNERID` FROM `BLOCKS` WHERE ID = " . $req["Id"];
		$result = mysql_query($q);
		while ($arr = mysql_fetch_array($result)) {
			if ($arr["OWNERID"] == $metabase["sessionOwner"]) {
				$q = "UPDATE `BLOCKS` SET `CONTENT` = '" . $req["Content"] . "' WHERE `ID` = " . $req["Id"];
				$r = mysql_query($q) || die (mysql_error());

				if ($r) {
					$res["status"] = "UPDATESUCCESS";	
				}
				else {
					$res["status"] = "ERROR";
					$res["message"] = "Update failed";
				}
			}
			else {
				$res["status"] = "ERROR";
				$res["message"] = "No rights to update the block";
			}
		}
	}
	else {
		$res["status"] = "ERROR";
		$res["message"] = "No id or content in request";
	}
?>