// data.js
const initialDiaries = [
    {
        id: 1,
        title: "아리가토 고쟈이맛스 !",
        location: "교토",
        date: "2026-02-10",
        content: "기모노 입고 교토의 낭만 즐기기 !",
        img: "images/kyoto.jpg",
        coords: { lat: 34.9949, lng: 135.7850 }
    },
    {
        id: 2,
        title: "시골쥐의 서울 냄새 맡기",
        location: "서울",
        date: "2026-02-26",
        content: "한강과 노을의 조합이란 ,, ",
        img: "images/seoul.jpg",
        coords: { lat: 37.5796, lng: 126.9770 }
    },
    {
        id: 3,
        title: "눈부셔 에펠탑",
        location: "파리",
        date: "2025-12-25",
        content: "에펠탑은 죽기 전에 한 번은 봐야한다더니 .. 이유를 알았다..",
        img: "images/paris.jpg",
        coords: { lat: 48.8584, lng: 2.2945 }
    },
    {
        id: 4,
        title: "혼자옵서예",
        location: "제주도",
        date: "2025-07-20",
        content: "뭐랭하맨 ?",
        img: "images/jeju.jpg",
        coords: { lat: 33.3938, lng: 126.2391 }
    },
    {
        id: 5,
        title: "이곳이 지상낙원이여라.",
        location: "발리",
        date: "2025-08-25",
        content: "Ah.. 여기서 태어날걸..",
        img: "images/bali.jpg",
        coords: { lat: -8.5069, lng: 115.2625 }
    }
];

window.myDiaries = JSON.parse(localStorage.getItem('myTravelDiaries')) || initialDiaries;