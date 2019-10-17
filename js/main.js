'use strict';
var now_pos_lat;
var now_pos_lng;


function initMap() {
    var target = document.getElementById('gmap');
    //マップを生成して表示
    var map = new google.maps.Map(target, {
      center: {lat: 35.681167, lng: 139.767052},
      zoom: 15
    });
    //情報ウィンドウのインスタンスの生成
    var infoWindow = new google.maps.InfoWindow;
    //ブラウザが Geolocation に対応しているかを判定
    //対応していない場合の処理
    if(!navigator.geolocation){
      //情報ウィンドウの位置をマップの中心位置に指定
      infoWindow.setPosition(map.getCenter());
      //情報ウィンドウのコンテンツを設定
      infoWindow.setContent('Geolocation に対応していません。');
      //情報ウィンドウを表示
      infoWindow.open(map);
    }

    //ブラウザが対応している場合、position にユーザーの位置情報が入る
    navigator.geolocation.getCurrentPosition(function(position) {
      //position から緯度経度（ユーザーの位置）のオブジェクトを作成し変数に代入
        var now_pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        now_pos_lat = position.coords.latitude;
        now_pos_lng = position.coords.longitude;
        console.log(now_pos_lat,now_pos_lng);
      //情報ウィンドウに現在位置を指定
      infoWindow.setPosition(now_pos);
      //情報ウィンドウのコンテンツを設定
      infoWindow.setContent('現在位置を取得しました。');
      //情報ウィンドウを表示
      infoWindow.open(map);
      //マップの中心位置を指定
      map.setCenter(now_pos);
    }, function() {  //位置情報の取得をユーザーがブロックした場合のコールバック
      //情報ウィンドウの位置をマップの中心位置に指定
      infoWindow.setPosition(map.getCenter());
      //情報ウィンドウのコンテンツを設定
      infoWindow.setContent('Error: 位置情報が無効です。');
      //情報ウィンドウを表示
      infoWindow.open(map);
    });
}

var direction_start;                        //ジオコード済みの出発地の緯度経度
var start_x;
var start_y;
var direction_end;                         //ジオコード済みの目的地の緯度経度
var end_x;
var end_y;
var directionPaths = [];
var tri_way;
var total_dir;
// var defalt_resHTML = document.getElementById('res_main').innerHTML;    //再読み込み時の結果HTMLの初期化

//経路探索処理
function scrach_dire(){
    //地図更新------------------------------------------------------------------
    var target = document.getElementById('gmap');
    var map = new google.maps.Map(target, {
    });
    // 移動手段選択------------------------------------------------------------------
    tri_way = document.getElementById("tri_way").tri_way.value;
    // 出発地の処理------------------------------------------------------------------
    var start_place = document.getElementById("start_dir").value;   //出発地の入力ウィンドウ
    var end_place = document.getElementById("end_dir").value;       //出発地の出力ウィンドウ
    //各座標取得-----------------------------------------------------------------
    //出発地と到着地------------------------------------------------------------
    var start_geocoder = new google.maps.Geocoder();
    var end_geocoder = new google.maps.Geocoder();
    //出発地のジオコード処理-------------------------------------------------------------------------------
        start_geocoder.geocode(
            {
                address:start_place
            },
            function (results,status){
                if (status === 'OK' && results[0]){
                    var start_latlag = (results[0].geometry.location);
                    // 目的地のジオコード処理----------------------------------------------------------------------
                    end_geocoder.geocode({
                        address:end_place
                    },
                    function (results,status){
                        if (status === 'OK' && results[0]){
                            var end_latlag = (results[0].geometry.location);
                            // 経路の処理----------------------------------------------------------------------
                            var directionsService = new google.maps.DirectionsService(); //DirectionsRenderer のオブジェクトを生成
                            var directionsRenderer = new google.maps.DirectionsRenderer();//directionsRenderer と地図を紐付け
                            directionsRenderer.setMap(map);
                            var result_area = document.getElementById('result_area');
                            result_area.textContent = null; //初期化
                            result_area.style.visibility ="hidden";
                            directionsRenderer.setPanel(result_area);
                            //現在地を出発地へ代入---------------------------------------------------------------------
                            // var start;
                            if (document.getElementById("start_dir").value === "現在地"){
                                var direction_start = new google.maps.LatLng(now_pos_lng, now_pos_lat);
                            //---------------------------------------------------------------------------------------------------
                            }else{
                                var direction_start = start_latlag;
                            }
                            //リクエストの終着点の位置
                            var direction_end = end_latlag;
                            // ルートを取得するリクエスト
                            console.log(direction_start,direction_end);
                            start_x = direction_start.lat();
                            start_y = direction_start.lng();
                            console.log(direction_start.lat());
                            console.log(direction_start.lng());
                            end_x = direction_end.lat();
                            end_y = direction_end.lng();
                            var request = {
                                origin: direction_start,      // 出発地点の緯度経度
                                destination: direction_end,   // 到着地点の緯度経度
                                travelMode: tri_way //トラベルモード
                            };
                            //DirectionsService のオブジェクトのメソッド route() にリクエストを渡し、
                            //コールバック関数で結果を setDirections(result) で directionsRenderer にセットして表示
                            directionsService.route(request, function(result, status) {
                                //ステータスがOKの場合、
                                if (status === 'OK') {
                                    directionsRenderer.setDirections(result); //取得したルート（結果：result）をセット
                                    var myRoute = result.routes[0];
                                    //ここから経路の詳細座標をとる
                                    for(let l = 0; l < myRoute.legs.length; l++ ){
                                        for(let m = 0; m < myRoute.legs[l].steps.length; m++ ){
                                            directionPaths.push( myRoute.legs[0].steps[m].path );
                                        }
                                        total_dir =myRoute.legs[l].steps.length;
                                        console.log(myRoute.legs[l].steps.length);
                                    }

                                }else{
                                alert("取得できませんでした：" + status);
                                }
                            });
                        }
                    })}else{
                        //ステータスが OK 以外の場合や results[0] が存在しなければ、アラートを表示して処理を中断
                        alert('失敗しました。理由: ' + status);
                        return;
                    }
            }
        )
}
//現在地を入れる
function in_nowPlace(){
    const now_start = document.getElementById("start_dir");
    now_start.value = "現在地";
}
//返しのHTML要素結果

function result_panel(){
    //結果のスタイル整え====================================================================================
        //出発地と目的地を消す-----------------------------------------------------------------------------
        $(".adp-placemark").css("display" , "none");
        //SUMMARYを取る---------------------------------------------------------------------------------------
        var summary = $(".adp-summary");
        //html要素の追加--------------------------------------------------------------------------------------
        $("#summary_area").css("display" , "block");
        var summary_text = summary.text();                          //結果の文字列を取る
        summary_text = summary_text.replace(".","　　総時間:");
        $("#summary_area").append(`<div id = "summary_res">総距離：${summary_text}</div>`);
        summary.css("font-size","25px");

    //===================================================================================================
    //交差点での座標を取得、地図を生成------------------------------------------------------------------------
    var action_lat = directionPaths[11][0].lat();
    var action_lng = directionPaths[11][0].lng();
    console.log(action_lat);
    console.log(action_lng);
    var addmap = document.getElementById("addmapID");                 //ミニマップの要素取得
    var addgmap = new google.maps.Map(addmap, {
        center: { // 地図の中心を指定
            lat: action_lat,// 緯度
            lng: action_lng // 経度
        },
        zoom: 10, // 地図のズームを指定
        mapTypeControl: false, //マップタイプ コントロール
        fullscreenControl: true, //全画面表示コントロール
        streetViewControl: false, //ストリートビュー コントロール
        zoomControl: false
    });
    console.log("zoom:" + addgmap.zoom);

    var marker = new google.maps.Marker({
        position: addgmap.getCenter(),
        map: addgmap,
    });

    // //経路を地図に紐付けるの情報をグローバル変数から取る------------------------------------------------------------
    console.log(start_x , start_y);
    var direction_start = new google.maps.LatLng(start_x , start_y);            //座標から出発地のオブジェクトの生成
    var direction_end = new google.maps.LatLng(end_x , end_y);
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(addgmap);
    directionsRenderer.setOptions(
        {
        suppressMarkers: true
    });
    var request = {
        origin: direction_start,
        destination: direction_end,
        travelMode: tri_way,
    };
    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            addgmap.zoom = 16;
        }else{
            alert("取得できませんでした：" + status);
        }
    });
    // 中心を更新する。
    // zoom = 16;
    // setzoom(zoom);

    //検索結果を整える---------------------------------------------------------------------------------------------------------
    var result_area = document.getElementById('result_area');
    result_area.style.visibility ="visible";
    //jQueryで子孫セレクタを取りに行く
    //このfor文で各地点の地図を表示する===========================================================================================
    for (var i =0;i<total_dir;i++){                                     //iは交差点の順序になっている。
        var ditalDire = $("table.adp-directions").find("tbody tr").filter(function(){   //各表示の一番外側の要素の取得
            return $(this).data("stepIndex")==i;
        });
        var result_text = ditalDire.text();                             //要素のテキストを取り出す
        if (result_text.indexOf('有料区間') !== -1){
            var div = $(`<div class="result_ele_high" id = "crossRoadId${i}"></div>`);             //高速道路は緑に
            ditalDire.wrap(div);                                                                   //div親要素のカバーをつける
            $(`#crossRoadId${i}`).append(`<div class = "addmap" id = "addmapId${i}"></div>`);                       //要素の最後に地図を表示するエリアを確保
            minMap(i);              //地図取得の関数に、通し番号を引数に実行

            //経路を地図に紐付けるの情報をグローバル変数から取る------------------------------------------------------------
            // console.log(start_x , start_y);
            // var direction_start = new google.maps.LatLng(start_x , start_y);            //座標から出発地のオブジェクトの生成
            // var direction_end = new google.maps.LatLng(end_x , end_y);
            // var directionsService = new google.maps.DirectionsService();
            // var directionsRenderer = new google.maps.DirectionsRenderer();
            // directionsRenderer.setMap(addgmap);
            // directionsRenderer.setOptions({
            //     suppressMarkers: true
            // });
            // var request = {
            //     origin: direction_start,
            //     destination: direction_end,
            //     travelMode: tri_way,
            // };
            // directionsService.route(request, function(result, status) {
            //     if (status === 'OK') {
            //         directionsRenderer.setDirections(result);
            //         addgmap.zoom = 16;
            //     }else{
            //         alert("取得できませんでした：" + status);
            //     }
            // });


        }else{
            var div = $(`<div class="result_ele" id = "crossRoadId${i}"></div>`);             //一般道は青に
            ditalDire.wrap(div);                                        //div親要素をつける
            $(`#crossRoadId${i}`).append(`<div class = "addmap" id = "addmapId${i}"></div>`);     //要素の最後に地図を表示するエリアを確保
            minMap(i);
        }
    }
}

//ミニマップ表示の関数==============================================================================================================
function minMap(i){
    var action_lat = directionPaths[i][0].lat();
    var action_lng = directionPaths[i][0].lng();
    console.log(`ID:${i}(`+ action_lat,action_lng +")");

    var addmap = document.getElementById(`addmapId${i}`);                                   //ミニマップの要素取得
    var addgmap = new google.maps.Map(addmap, {
        center: { // 地図の中心を指定
            lat: action_lat,// 緯度
            lng: action_lng // 経度
        },
        zoom: 17, // 地図のズームを指定
        mapTypeControl: false, //マップタイプ コントロール
        fullscreenControl: true, //全画面表示コントロール
        streetViewControl: false, //ストリートビュー コントロール
        zoomControl: false
    });
        // console.log("zoom:"+addgmap.zoom);
    var marker = new google.maps.Marker({
        position: addgmap.getCenter(),
        map: addgmap,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/micons/green-dot.png",
            scaledSize: new google.maps.Size(40, 40)
            },
    });
        //経路を地図に紐付けるの情報をグローバル変数から取る------------------------------------------------------------
            // console.log(start_x , start_y);
            // var direction_start = new google.maps.LatLng(start_x , start_y);            //座標から出発地のオブジェクトの生成
            // var direction_end = new google.maps.LatLng(end_x , end_y);
            // var directionsService = new google.maps.DirectionsService();
            // var directionsRenderer = new google.maps.DirectionsRenderer();
            // directionsRenderer.setMap(addgmap);
            // directionsRenderer.setOptions({
            //     suppressMarkers: true
            // });
            // var request = {
            //     origin: direction_start,
            //     destination: direction_end,
            //     travelMode: tri_way,
            // };
            // directionsService.route(request, function(result, status) {
            //     if (status === 'OK') {
            //         directionsRenderer.setDirections(result);
            //         addgmap.zoom = 16;
            //     }else{
            //         alert("取得できませんでした：" + status);
            //     }
            // });
}
//==========================================================================================================================