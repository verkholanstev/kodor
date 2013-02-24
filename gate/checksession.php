<?php
	//$res - response array

	$sessionExists = false;
	$metabase = array();
	if (isset($_COOKIE["session"]))	{
		$q = "SELECT `SESSIONID`, `EXPIRES`, `OWNERID`, `USERNAME`, `HTMLALLOWED` 
			FROM `SESSIONS` LEFT JOIN `USERS` ON `SESSIONS`.`OWNERID` = `USERS`.`ID` 
			WHERE `SESSIONID` = '" . $_COOKIE["session"] . "'";
		//$q = "SELECT * FROM `SESSIONS` WHERE `SESSIONID` = '" . $_COOKIE["session"] . "'";
		$result = mysql_query($q);
		while ($array = mysql_fetch_array($result)) {
			$sessionExists = true;
			$session = array(
				"sessionId" => $array["SESSIONID"],
				"expires" => $array["EXPIRES"],
				"username" => $array["USERNAME"],
				"isHtmlAllowed" => (int) $array["HTMLALLOWED"]
			);
			$metabase = array(
				"sessionOwner" => $array["OWNERID"],
				"htmlAllowed" => (int) $array["HTMLALLOWED"]
				);
		}

		if ($sessionExists) {
			if ($req["Command"] == "Hello") {
				$res["session"] = $session;
			}
			else {
				//If session exists, but command is not "Hello"
			}
		}
		else {
			$error = array(
				"status" => "SESSIONERROR",
				"timestamp" => time()
			);
			die(json_encode($error));
		}
	}
	else {
		$session = array();
		if ($req["Command"] == "Hello") {
			$q = "SELECT `SESSIONID`, `EXPIRES`, `OWNERID`, `USERNAME`, `HTMLALLOWED` 
				FROM `SESSIONS` LEFT JOIN `USERS` ON `SESSIONS`.`OWNERID` = `USERS`.`ID`
				WHERE `SESSIONS`.`ID` = 2"; //Guest session
			$result = mysql_query($q);
			while ($array = mysql_fetch_array($result)) {
				$session = array(
					"sessionId" => $array["SESSIONID"],
					"expires" => $array["EXPIRES"],
					"username" => $array["USERNAME"],
					"isHtmlAllowed" => $array["HTMLALLOWED"]
				);
				$metabase["sessionOwner"] = $array["OWNERID"];
			}

			$res["session"] = $session;
		}
		else {
			// Send error message
			die("{'error': 'Problem with cookies'}");
		}
	}
?>