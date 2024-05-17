# BusRouteFinder(Frontend)

코드 개더러움 ㅋ

백엔드 보고싶으면 [GoldenMine0502/BusRouteFinderBackend: 토이프젝](https://github.com/GoldenMine0502/BusRouteFinderBackend)

# 버스 최적경로 계산 사이트

인천시에 대해 버스 경로 최단거리를 계산합니다.

<img width="1584" alt="image" src="https://github.com/GoldenMine0502/BusRouteFinderFrontend/assets/27873716/fe4d2139-51d1-4cc7-91e7-cc6c305490e0">

출발지와 도착지는 무조건 정류장만 설정 가능합니다. 위 예시는 인천대학교 공과대학 > 부평역까지 가는 버스 최단 경로를 제공합니다.

없는 98번이 왜 나오냐면 2022년 9월 기준 데이터니까 참고만 하십쇼

<img width="487" alt="image" src="https://github.com/GoldenMine0502/BusRouteFinderFrontend/assets/27873716/2d6a3662-60e3-48cb-9ca6-009e78d65348">

검색어 자동완성을 지원합니다.

<img width="1584" alt="image" src="https://github.com/GoldenMine0502/BusRouteFinderFrontend/assets/27873716/c99d7689-abd7-4508-80ed-85555227bc1b">

특정 버스 경로를 볼 수 있습니다.

<img width="484" alt="image" src="https://github.com/GoldenMine0502/BusRouteFinderFrontend/assets/27873716/03fc3d05-977a-4e77-b0bc-d190672e9997">

특정 정류장 short id에 대한 위치를 볼 수 있습니다.

로그인시, 버스 경로를 저장할 수 있습니다. rest api는 존재하지만 UI상 회원 가입 기능은 없습니다. 그냥 SQL INSERT 하든지 관리자 페이지 들어가서 만드십쇼 

초기 관리자는 직접 SQL로 설정합니다.

UPDATE user SET is_admin = TRUE WHERE id = 1;

어드민 로그인을 지원합니다. is_admin 컬럼이 1이면 로그인시 어드민 페이지로 리디렉트 됩니다.



# 특징

기본적으로 최단거리 경로를 제공합니다. 

도보 지원합니다. 도보 이동은 실제 디스턴스보다 4-6배 높게 적용

환승 지원합니다. 환승시 2.5km 더 간 걸로 간주해 계산됩니다.



# 한계

refresh token이 없고 세션 만료시 튕김도 없습니다. 오류 나면 직접 로그아웃 후 로그인 직접 다시 하셔야 합니다.

배차 간격을 고려하지 않습니다. 같은 경로의 버스의 경우 DB상 앞에 있는 버스가 선택됩니다.

인천만 지원합니다.

데이터베이스 수업이라 ORM 못써서 코드가 더럽습니다.

사실 수업은 핑계고 그냥 코드가 더럽습니다. 아 불만족스럽네요 누구코에붙임이걸
