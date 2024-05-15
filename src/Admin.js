import React, {useState} from 'react'

let currentEditRequest = null;
function Admin() {
    const [currentJSX, setCurrentJSX] = useState(null)
    const [mode, setMode] = useState("log")
    const [currentValue, setCurrentValue] = useState("")
    // const [currentEditRequest, setCurrentEditRequest] = useState(null)

    const getLogs = () => {
        const currentAccessToken = localStorage.getItem('accessToken')
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

        fetch('http://localhost:8100/search/alllog', requestOptions)
            .then(async (response) => {
                const data = await response.json()
                console.log("admin", data)

                const jsx = data["list"].map((log, i) => {
                    console.log(log)
                    const start = log["start"]
                    const end = log["end"]

                    const deleteLog = () => {
                        const currentAccessToken = localStorage.getItem('accessToken')

                        console.log('log', log["id"], JSON.stringify({
                            id: log["id"]
                        }))


                        const requestOptions = {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${currentAccessToken}`
                            },
                            body: JSON.stringify({
                                id: log["id"]
                            })
                        };

                        fetch('http://localhost:8100/search/log', requestOptions)
                            .then(async (response) => {
                                getLogs();
                                currentEditRequest = null;
                                setCurrentValue(null)
                            })
                    }

                    return (<div>{`${start}->${end}`} <a onClick={deleteLog}>삭제</a></div>)
                })

                setCurrentJSX(jsx)
            })
    }

    const getBus = () => {
        fetch('http://localhost:8100/route/bus')
            .then(async response => await response.json())
            .then(data => {
                console.log(data)

                const sendEditOrAdd = (values, method) => {
                    console.log('버스수정', values)
                    if(values == null) return;

                    const currentAccessToken = localStorage.getItem('accessToken')

                    values = values.split(",")

                    const requestOptions = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentAccessToken}`
                        },
                        body: JSON.stringify({
                            routeId: values[0],
                            routeLen: parseInt(values[1]),
                            routeNo: values[2],
                            originBusStopId: parseInt(values[3]),
                            destBusStopId: parseInt(values[4]),
                            busStartTime: values[5],
                            busFinishTime: values[6],
                            maxAllocationGap: parseInt(values[7]),
                            minAllocationGap: parseInt(values[8]),
                            routeType: parseInt(values[9]),
                            turnBusStopId: parseInt(values[10])
                        })
                    };

                    fetch('http://localhost:8100/route/bus', requestOptions)
                        .then(async (response) => {
                            // const data = await response.json()
                            // console.log("admin", data)
                            getBus()
                        })
                }

                const sendDelete = (id) => {
                    const currentAccessToken = localStorage.getItem('accessToken')

                    const requestOptions = {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentAccessToken}`
                        },
                        body: JSON.stringify({
                            id: id
                        })
                    };

                    fetch('http://localhost:8100/route/bus', requestOptions)
                        .then(async (response) => {
                            // const data = await response.json()
                            // console.log("admin", data)
                            getBus()
                        })
                }

                const jsx = data.map((bus, i) => {
                    console.log(bus)
                    //                             "routeId": values[0],
                    //                             "routeLen": parseInt(values[1]),
                    //                             "routeNo": values[2],
                    //                             "originBusStopId": parseInt(values[3]),
                    //                             "destBusStopId": parseInt(values[4]),
                    //                             "busStartTime": values[5],
                    //                             "busFinishTime": values[6],
                    //                             "maxAllocationGap": parseInt(values[7]),
                    //                             "minAllocationGap": parseInt(values[8]),
                    //                             "routeType": parseInt(values[9]),
                    //                             "turnBusStopId": parseInt(values[10])
                    const routeId = bus["routeId"]
                    const routeLen = bus["routeLen"]
                    const routeNo = bus["routeNo"]
                    const originBusStopId = bus["originBusStopId"]
                    const destBusStopId = bus["destBusStopId"]
                    const busStartTime = bus["busStartTime"]
                    const busFinishTime = bus["busFinishTime"]
                    const maxAllocationGap = bus["maxAllocationGap"]
                    const minAllocationGap = bus["minAllocationGap"]
                    const routeType = bus["routeType"]
                    const turnBusStopId = bus["turnBusStopId"]

                    const totalStr = `${routeId},${routeLen},${routeNo},${originBusStopId},${destBusStopId},${busStartTime},${busFinishTime},${maxAllocationGap},${minAllocationGap},${routeType},${turnBusStopId}`

                    return (<div><div onClick={event => {
                        setCurrentValue(totalStr)
                        currentEditRequest = sendEditOrAdd
                    }}>{totalStr}</div> <div onClick={() => sendDelete(routeId)}>삭제</div></div>)
                })

                currentEditRequest = sendEditOrAdd
                setCurrentJSX(jsx)
            })
    }

    const getStation = () => {
        fetch('http://localhost:8100/route/busstation')
            .then(async response => await response.json())
            .then(data => {
                console.log(data)

                const sendEditOrAdd = (values, method) => {
                    console.log('정류장수정', values)
                    if(values == null) return;
                    const currentAccessToken = localStorage.getItem('accessToken')

                    values = values.split(",")

                    //         "id": 101000015,
                    //         "name": "종근당.충정로역",
                    //         "posX": 196798.736844,
                    //         "posY": 450816.313491,
                    //         "shortId": 11002,
                    //         "adminName": "인천광역시",
                    const requestOptions = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentAccessToken}`
                        },
                        body: JSON.stringify({
                            id: parseInt(values[0]),
                            name: values[1],
                            posX: parseFloat(values[2]),
                            posY: parseFloat(values[3]),
                            shortId: parseInt(values[4]),
                            adminName: values[5],
                        })
                    };

                    fetch('http://localhost:8100/route/busstation', requestOptions)
                        .then(async (response) => {
                            // const data = await response.json()
                            // console.log("admin", data)
                            getStation()
                        })
                }

                const sendDelete = (id) => {
                    const currentAccessToken = localStorage.getItem('accessToken')

                    const requestOptions = {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentAccessToken}`
                        },
                        body: JSON.stringify({
                            id: id
                        })
                    };

                    fetch('http://localhost:8100/route/busstation', requestOptions)
                        .then(async (response) => {
                            // const data = await response.json()
                            // console.log("admin", data)
                            getStation()
                            console.log('delete station')
                        })
                }

                const jsx = data.map((bus, i) => {
                    // console.log(bus)
                    //                            "id": parseInt(values[0]),
                    //                             "name": values[1],
                    //                             "posX": parseFloat(values[2]),
                    //                             "posY": parseFloat(values[3]),
                    //                             "shortId": parseInt(values[4]),
                    //                             "adminName": values[5],
                    const id = bus["id"]
                    const name = bus["name"]
                    const posX = bus["posX"]
                    const posY = bus["posY"]
                    const shortId = bus["shortId"]
                    const adminName = bus["adminName"]

                    const totalStr = `${id},${name},${posX},${posY},${shortId},${adminName}`

                    return (<div><div onClick={event => {
                        setCurrentValue(totalStr)
                        currentEditRequest = sendEditOrAdd
                    }}>{totalStr}</div> <div onClick={() => sendDelete(id)}>삭제</div></div>)
                })

                currentEditRequest = sendEditOrAdd
                setCurrentJSX(jsx)
            })
    }

    const getThrough = () => {
        fetch('http://localhost:8100/route/busthrough')
            .then(async response => await response.json())
            .then(data => {
                console.log(data)

                const sendEditOrAdd = (values, method) => {
                    console.log('경로수정', values)
                    const currentAccessToken = localStorage.getItem('accessToken')

                    if(values == null) return;

                    values = values.split(",")

                    //        "id": 1,
                    //         "routeId": "165000078",
                    //         "busStopStationId": 163000560,
                    //         "busStopSequence": 1
                    const requestOptions = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentAccessToken}`
                        },
                        body: JSON.stringify({
                            id: parseInt(values[0]),
                            routeId: values[1],
                            busStopStationId: parseInt(values[2]),
                            busStopSequence: parseInt(values[3]),
                        })
                    };

                    fetch('http://localhost:8100/route/busthrough', requestOptions)
                        .then(async (response) => {
                            // const data = await response.json()
                            // console.log("admin", data)
                            getThrough()
                        })
                }

                const sendDelete = (id) => {
                    const currentAccessToken = localStorage.getItem('accessToken')

                    const requestOptions = {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentAccessToken}`
                        },
                        body: JSON.stringify({
                            id: id
                        })
                    };

                    fetch('http://localhost:8100/route/busthrough', requestOptions)
                        .then(async (response) => {
                            // const data = await response.json()
                            // console.log("admin", data)
                            getThrough()
                        })
                }

                const jsx = data.map((bus, i) => {
                    console.log(bus)
                    //                             "id": parseInt(values[0]),
                    //                             "routeId": values[1],
                    //                             "busStopStationId": parseInt(values[2]),
                    //                             "busStopSequence": parseInt(values[3]),
                    const id = bus["id"]
                    const routeId = bus["routeId"]
                    const busStopStationId = bus["busStopStationId"]
                    const busStopSequence = bus["busStopSequence"]

                    const totalStr = `${id},${routeId},${busStopStationId},${busStopSequence}`

                    return (<div><div onClick={event => {
                        setCurrentValue(totalStr)
                        currentEditRequest = sendEditOrAdd
                    }}>{totalStr}</div> <div onClick={() => sendDelete(id)}>삭제</div></div>)
                })

                currentEditRequest = sendEditOrAdd
                setCurrentJSX(jsx)
            })
    }

    const getUser = () => {
        const currentAccessToken = localStorage.getItem('accessToken')
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentAccessToken}`
            },
        };
        fetch('http://localhost:8100/user/user', requestOptions)
            .then(async response => await response.json())
            .then(data => {
                console.log(data)

                const sendEditOrAdd = (values, method) => {
                    console.log('유저수정', values)
                    if(values == null) return;

                    const currentAccessToken = localStorage.getItem('accessToken')
                    values = values.split(",")

                    //         "id": 1,
                    //         "accountId": "admin",
                    //         "password": "{bcrypt}$2a$10$6vcM6UbF3L2U1AHfTD6l.uJu4zV0XY7Yw.nIM17XUHWblwPnXqXZW",
                    //         "nickname": "admin",
                    //         "isAdmin": true
                    const requestOptions = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentAccessToken}`
                        },
                        body: JSON.stringify({
                            id: parseInt(values[0]),
                            accountId: values[1],
                            password: values[2],
                            nickname: values[3],
                            isAdmin: (values[4]?.toLowerCase?.() === 'true'),
                        })
                    };

                    fetch('http://localhost:8100/user/user', requestOptions)
                        .then(async (response) => {
                            // const data = await response.json()
                            // console.log("admin", data)
                            getUser()
                        })
                }

                const sendDelete = (id) => {
                    const currentAccessToken = localStorage.getItem('accessToken')

                    const requestOptions = {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentAccessToken}`
                        },
                        body: JSON.stringify({
                            id: id
                        })
                    };

                    fetch('http://localhost:8100/user/user', requestOptions)
                        .then(async (response) => {
                            // const data = await response.json()
                            // console.log("admin", data)
                            getUser()
                            console.log('delete user')
                        })
                }

                const jsx = data.map((bus, i) => {
                    console.log(bus)
                    //         "id": 1,
                    //         "accountId": "admin",
                    //         "password": "{bcrypt}$2a$10$6vcM6UbF3L2U1AHfTD6l.uJu4zV0XY7Yw.nIM17XUHWblwPnXqXZW",
                    //         "nickname": "admin",
                    //         "isAdmin": true
                    const id = bus["id"]
                    const accountId = bus["accountId"]
                    const password = bus["password"]
                    const nickname = bus["nickname"]
                    const isAdmin = bus["isAdmin"]

                    const totalStr = `${id},${accountId},${password},${nickname},${isAdmin}`

                    return (<div><div onClick={event => {
                        setCurrentValue(totalStr)
                        currentEditRequest = sendEditOrAdd
                    }}>{totalStr}</div> <div onClick={() => sendDelete(id)}>삭제</div></div>)
                })

                currentEditRequest = sendEditOrAdd
                setCurrentJSX(jsx)
            })
    }

    const updateDB = () => {

    }

    if (currentJSX == null) {
        getLogs()
        return <div></div>
    } else {
        return <div>
            <input type="text" value={currentValue} onChange={event => setCurrentValue(event.target.value)}/>
            <button onClick={event => {
                console.log(currentEditRequest)
                if (currentEditRequest != null) {
                    currentEditRequest(currentValue, 'PATCH')
                }
            }}>수정
            </button>
            <button onClick={event => {
                if (currentEditRequest != null) {
                    currentEditRequest(currentValue, 'PUT')
                }
            }}>추가
            </button>
            <button onClick={getLogs}>로그</button>
            <button onClick={getStation}>정류장</button>
            <button onClick={getThrough}>경로</button>
            <button onClick={getBus}>버스</button>
            <button onClick={getUser}>유저</button>
            <button onClick={getUser}>업데이트</button>
            <div style={{overflowY: "scroll"}}>
                {currentJSX}
            </div>
        </div>
    }
}

export default Admin;