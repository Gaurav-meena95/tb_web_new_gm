<?php

    //Detect special conditions devices
    $iPod    = stripos($_SERVER['HTTP_USER_AGENT'],"iPod");
    $iPhone  = stripos($_SERVER['HTTP_USER_AGENT'],"iPhone");
    $iPad    = stripos($_SERVER['HTTP_USER_AGENT'],"iPad");
    $Android = stripos($_SERVER['HTTP_USER_AGENT'],"Android");


    //do something with this information
    if( $iPod || $iPhone ) {
        $redirect_url = "https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1336926442&mt=8";
    }
    else if($iPad) {
        $redirect_url = "https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1336926442&mt=8";
    
    }
    else if($Android) {
        $redirect_url = "https://play.google.com/store/apps/details?id=com.beatravelbuddy.travelbuddy&hl=en&pli=1";
        
    }
    else {
        $redirect_url = "https://beatravelbuddy.com";
    }
    header("Location: $redirect_url");
    exit();

?> 
