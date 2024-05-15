import React, {useEffect, useState} from 'react'
import {Navigate, redirect} from "react-router-dom";
import "./Main.css"
import "./InputText.css"
import "./SelectBar.css"

const INU_LATITUDE = 37.3751;
const INU_LONGITUDE = 126.6328;

const {kakao, proj4} = window;

let map = null;
const mapObjects = [];
let lastDragEndEvent = null;

function Main() {
    // const [accessToken, setAccessToken] = useState(null)
    const [id, setId] = useState("")
    const [password, setPassword] = useState("")
    const [startId, setStartId] = useState("")
    const [endId, setEndId] = useState("")
    const [loginResponse, setLoginResponse] = useState(null)
    const [logs, setLogs] = useState(null)
    const [dataList1, setDataList1] = useState((<datalist id="datalist1"></datalist>))
    const [dataList2, setDataList2] = useState((<datalist id="datalist2"></datalist>))

    const createMap = (markers) => {
        const container = document.getElementById('map');
        const options = {
            // 인천대학교 위도 경도: 37.3751° N, 126.6328° E
            center: new kakao.maps.LatLng(INU_LATITUDE, INU_LONGITUDE),
            level: 4,
            marker: markers
        };
        return new kakao.maps.Map(container, options)
    }

    const removeAllMapObjects = () => {
        while (mapObjects.length > 0) {
            const obj = mapObjects.pop();

            if (obj instanceof kakao.maps.Circle) {
                obj.setMap(null);
            }

            if (obj instanceof kakao.maps.Polyline) {
                obj.setMap(null);
            }

            if (obj instanceof kakao.maps.CustomOverlay) {
                obj.setMap(null);
            }
        }
    }

    const onLoginClick = (type) => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                password: password
            })
        };
        fetch('http://localhost:8100/user/login', requestOptions)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem("accessToken", data["accessToken"]);
                setLoginResponse(data)
                console.log(data)

                getLogs(data["accessToken"])

                console.log("isAdmin", data["isAdmin"])
            });
    }

    const onLogoutClick = () => {
        localStorage.removeItem('accessToken')
        setLoginResponse(null)
        setLogs(null)
    }

    const getLogs = (currentAccessToken) => {
        console.log(`get logs: ${currentAccessToken}`)
        // 액세스 토큰 없으면 반응하지 않음
        if (currentAccessToken == null) return;

        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAccessToken}`
            }
        };

        fetch('http://localhost:8100/search/mylog', requestOptions)
            .then(async (response) => {
                const data = await response.json()
                console.log(data)
                setLogs(data["list"])
            })
    }

    const parseValue = (value) => {
        if (value.includes("(") || value.includes(")")) {
            value = value.substring(value.lastIndexOf("(") + 1, value.lastIndexOf(")"))
        }

        return value
    }

    const getKeywordResultJSX = (keyword, idx) => {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        fetch(`http://localhost:8100/search/search?keyword=${keyword}`, requestOptions)
            .then((response) => response.json())
            .then((json) => {
                const options = json["list"].map((station, i) => {
                    const valueName = station["name"] + "(" + station["shortId"] + ")"
                    return <option value={valueName}></option>
                })

                const total = <datalist id={"datalist" + idx}>
                    {options}
                </datalist>

                console.log(options)

                if (idx === 1) {
                    setDataList1(total)
                } else {
                    setDataList2(total)
                }
            })
    }

    const drawMap = (data) => {
        removeAllMapObjects()
        const list = []
        const busList = []
        let lastRoute = null;
        console.log(data)

        for (let idx = 0; idx < data["list"].length; idx++) {
            const point = data["list"][idx]
            console.log(point)
            if (lastRoute == null || lastRoute !== point["busName"]) {
                const result = proj4('TM127', 'WGS84', [point["posX"], point["posY"]]);

                const latLng = new kakao.maps.LatLng(result[1], result[0])
                const content = `<div style="font-size: ${20}pt; background-color: white">${point["busName"]}</div>`;

                const customOverlay = new kakao.maps.CustomOverlay({
                    position: latLng,
                    content: content
                });

                busList.push(customOverlay)

                lastRoute = point["busName"]
            }
            const middleResult = proj4('TM127', 'WGS84', [point["posX"], point["posY"]])
            list.push(new kakao.maps.LatLng(middleResult[1], middleResult[0]));
        }

        const polyline = new kakao.maps.Polyline({
            path: list, // 선을 구성하는 좌표배열 입니다
            strokeWeight: 10, // 선의 두께 입니다
            strokeColor: '#000000', // 선의 색깔입니다
            strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
            strokeStyle: 'solid' // 선의 스타일입니다
        });

        mapObjects.push(polyline);
        polyline.setMap(map);

        for (let idx = 0; idx < busList.length - 1; idx++) {
            const overlay = busList[idx]
            mapObjects.push(overlay);
            overlay.setMap(map);
        }
    }

    const onClickRouteFind = (startId, endId) => {
        startId = parseValue(startId)
        endId = parseValue(endId)

        let headers;
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken != null) {
            // 로그인 상태이면 헤더에 로그인 정보 추가 전달
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        } else {
            headers = {
                'Content-Type': 'application/json',
            }
        }

        const requestOptions = {
            method: 'GET',
            headers: headers
        };

        //         {
        //             "posX": 167559.570852,
        //             "posY": 430102.008056,
        //             "stationName": "인천대학교공과대학",
        //             "shortId": 38377,
        //             "busName": "6-1"
        //         },
        if (startId.length > 0 && endId.length > 0) {
            fetch(`http://localhost:8100/route/find?startShortId=${startId}&endShortId=${endId}`, requestOptions)
                .then(async response => {
                    const data = await response.json()

                    drawMap(data)

                    getLogs(accessToken);
                })
                .then(error => {
                });
        }
    }

    useEffect(() => {
        // https://gist.github.com/allieus/1180051/ab33229e820a5eb60f8c7971b8d1f1fc8f2cfabb
        // https://fascinate-zsoo.tistory.com/29
        if (map == null) {
            proj4.defs('TM127', "+proj=tmerc +lat_0=38 +lon_0=127.0028902777777777776 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +towgs84=-146.43,507.89,681.46")
            proj4.defs('TM128', "+proj=tmerc +lat_0=38 +lon_0=128E +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +towgs84=-146.43,507.89,681.46")
            proj4.defs('GRS80', "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs")
            proj4.defs('EPSG:2097', "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43");
            proj4.defs('EPSG:4326', "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");

            map = createMap()

            console.log("init map")
        }

        console.log("use effect")
    });

    const currentLoggedTag = loginResponse != null && loginResponse["nickname"].length > 0 ? (
        <div>
            <div>{`안녕하세요, ${loginResponse["nickname"]}님`}</div>
            <button className="custom-btn selectbar_button" onClick={onLogoutClick}>로그아웃</button>
            {loginResponse["isAdmin"] && (
                <Navigate to="/admin" replace={true}/>
            )}
        </div>
    ) : <div></div>;

    const logList = logs != null ? logs.map((log, i) => {
        console.log(log)
        const startId = log["startId"].toString()
        const endId = log["endId"].toString()
        const start = log["start"]
        const end = log["end"]

        console.log(startId, endId)

        const onClick = () => {
            setStartId(startId)
            setEndId(endId)
            onClickRouteFind(startId, endId)
        }

        return (<div onClick={onClick}>{`${start}->${end}`}</div>)
    }) : "";

    const onRouteNumberTextChanged = (value) => {
        try {
            fetch(`http://localhost:8100/route/route?routeNo=${value}`)
                .then(async response => {
                    // try {
                        const data = await response.json()

                        drawMap(data)
                    // } catch(e) {
                    // }
                })
        } catch(e) {

        }
    }

    const onShortIdTextChanged = (value) => {
        try {
            fetch(`http://localhost:8100/route/station?shortId=${value}`)
                .then(async response => {
                    if(!response.ok) return;
                    const data = await response.json()
                    console.log(data)

                    const result = proj4('TM127', 'WGS84', [data["posX"], data["posY"]]);

                    const latLng = new kakao.maps.LatLng(result[1], result[0])
                    const content = `<div style="font-size: ${20}pt; background-color: white">${data["shortId"]}</div>`;

                    const customOverlay = new kakao.maps.CustomOverlay({
                        position: latLng,
                        content: content
                    });

                    removeAllMapObjects()
                    mapObjects.push(customOverlay);
                    customOverlay.setMap(map);
                })
        } catch(e) {

        }

    }

    return (
        <div className="root">
            <div className="selectbar_background">
                <div style={{margin: "30px 0px", fontSize: "38px"}}>Bus Route<br/>Simulation</div>

                <div className="col-3 input-effect">
                    <input className="effect-20" type="text" placeholder="ID" onChange={event => {
                        setId(event.target.value)
                    }}/>
                </div>
                <div className="col-3 input-effect">
                    <input className="effect-20" type="password" placeholder="Password" onChange={event => {
                        setPassword(event.target.value)

                    }}/>
                </div>
                <button className="custom-btn selectbar_button" onClick={onLoginClick}>로그인</button>

                {currentLoggedTag}

                <div className="col-3 input-effect">
                    <input className="effect-20" type="text" list="datalist1" placeholder="출발지" onChange={event => {
                        setStartId(event.target.value)
                        getKeywordResultJSX(event.target.value, 1)
                    }}/>
                </div>
                <div className="col-3 input-effect">
                    <input className="effect-20" type="text" list="datalist2" placeholder="도착지" onChange={event => {
                        setEndId(event.target.value)
                        getKeywordResultJSX(event.target.value, 2)
                    }}/>
                </div>
                <button className="custom-btn selectbar_button" onClick={() => onClickRouteFind(startId, endId)}>경로 계산
                </button>
                {logList}

                {dataList1}
                {dataList2}

                <div className="col-3 input-effect">
                    <input className="effect-20" type="text" placeholder="Route Number"
                           onChange={(event) => onRouteNumberTextChanged(event.target.value)}/>
                </div>


                <div className="col-3 input-effect">
                    <input className="effect-20" type="text" placeholder="Short Id"
                           onChange={(event) => onShortIdTextChanged(event.target.value)}/>
                </div>
            </div>
            <div id='map' style={{
                width: '100vw',
                height: '100vh'
            }}></div>
        </div>
    )
}

export default Main;