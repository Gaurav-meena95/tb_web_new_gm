// Branch.io Configuration
// Replace 'YOUR_BRANCH_APP_KEY_HERE' with your actual Branch.io app key
// You can find your app key in the Branch.io dashboard under Settings > App Settings

window.BRANCH_CONFIG = {
    appKey: 'key_live_dBqjs7JsNztHo4rlNX2vdjnkyweHRy24', // Test app key for debugging
    debug: false, // Set to true for development/debugging
    timeout: 10000, // Timeout for Branch operations in milliseconds
    linkDomain: 'beatravelbuddy.app.link' // Use Branch's default domain for live mode
};

// Initialize Branch.io with the configuration
(function(b,r,a,n,c,h,_,s,d,k){
    if(!b[n]||!b[n]._q){
        for(;s<_.length;)c(h,_[s++]);
        d=r.createElement(a);
        d.async=1;
        d.src="https://cdn.branch.io/branch-latest.min.js";
        r.getElementsByTagName(a)[0].appendChild(d);
        b[n]=h
    }
})(window,document,"script","branch",function(b,r){
    b[r]=function(){
        b._q.push([r,arguments])
    }
},{_q:[],_v:1},"addListener applyCode banner closeBanner closeJourney creditHistory credits data deepview deepviewCta first getCode init link logout redeem referrals removeListener sendSMS setBranchViewData setIdentity track validateCode trackCommerceEvent logEvent".split(" "), 0);

// Initialize Branch with the app key from config
// if (window.BRANCH_CONFIG && window.BRANCH_CONFIG.appKey !== 'YOUR_BRANCH_APP_KEY_HERE') {
//     branch.init(window.BRANCH_CONFIG.appKey);
// } else {
//     console.warn('Branch.io app key not configured. Please update branch-config.js with your actual app key.');
// }
