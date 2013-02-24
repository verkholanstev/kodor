<?php
	//$res - response array

	if ($req["Command"] == "Login") {
		if (isset($req["User"]) && isset($req["Password"])) {
			$q = "SELECT `PASSWORD`, `ID`, `HTMLALLOWED` FROM USERS WHERE `USERNAME` = '" . $req["User"] . "'";
			$result = mysql_query($q);

			$userExists = false;
			while ($arr = mysql_fetch_array($result)) {
				$userExists = true;
				if (md5($req["Password"]) == $arr["PASSWORD"]) {
					$sessionId = md5($req["User"] . $arr["PASSWORD"] . time());
					$q = "DELETE FROM `SESSIONS` WHERE `OWNERID` = " . $arr["ID"];
					$r = mysql_query($q);
					$expires = "2014-01-01 00:00:00";
					$q = "INSERT INTO `SESSIONS` (`SESSIONID`, `EXPIRES`, `OWNERID`) VALUES ('" . $sessionId . "', '" . $expires . "', '" . $arr["ID"] . "')";
					$r = mysql_query($q);

					$res["status"] = "LOGINSUCCESS";
					$res["session"] = array(
						"sessionId" => $sessionId, 
						"expires" => $expires, 
						"username" => $req["User"],
						"isHtmlAllowed" => (int) $arr["HTMLALLOWED"]
						);
				}
				else {
					$res["status"] = "LOGINFAIL";
					$res["error"] = "WRONGPASSWORD";
				}
			}

			if (!$userExists) {
				$res["status"] = "LOGINFAIL";
				$res["error"] = "NOUSER";
			}

			echo json_encode($res);
		}
	die();
	}

	if ($req["Command"] == "Logout") {
		if (isset($req["User"])) {
			$q = "SELECT `ID` FROM `USERS` WHERE `USERNAME` = '" . $req["User"] . "'";
			//echo $q;
			$result = mysql_query($q);
			while ($arr = mysql_fetch_array($result)) {
				$userId = $arr["ID"];
			}
			//echo $userId;
			if ($userId != 2) { // 2 = Guest session
				$q = "DELETE FROM `SESSIONS` WHERE `OWNERID` = " . $userId;
				$result = mysql_query($q);
				
				$res["status"] = "LOGOUTSUCCESS";
			}
			else {
				$res["status"] = "LOGOUTFAIL";
				$res["error"] = "GUESTSESSION";
			}
		}
		else {
			$res["status"] = "LOGOUTFAIL";
			$res["error"] = "NOUSER";
		}
		echo json_encode($res);
		die();
	}
?>