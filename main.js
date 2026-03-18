// 1. 전역 변수 (맨 위에 배치)
let myDiaries = JSON.parse(localStorage.getItem('myTravelDiaries')) || initialDiaries;
let currentImageData = ""; 
let currentSelectedIndex = -1;
const bookContainer = document.getElementById('book-container');


// 서브 타이틀 애니메이션

const phrases = [
    "당신의 기억을 기록하세요",       // 한국어
    "Record your memories",         // 영어
    "記録を残してください",           // 일본어
    "Enregistrez vos souvenirs",    // 프랑스어
    "Graba tus recuerdos",          // 스페인어
    "記錄您的"                  // 중국어(번체)
];

let phraseIndex = 0;
const subtitleEl = document.getElementById('dynamic-subtitle');

function rotateSubtitle() {
    if (!subtitleEl) return;

    // 1. 먼저 서서히 사라지게 함
    subtitleEl.classList.add('fade-out');

    // 2. 완전히 사라진 시점(0.8초 뒤)에 글자를 바꾸고 다시 나타나게 함
    setTimeout(() => {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        subtitleEl.innerText = phrases[phraseIndex];
        subtitleEl.classList.remove('fade-out');
    }, 800);
}

// 4초마다 문구 교체 시작
setInterval(rotateSubtitle, 3500);

// 2. 함수 정의 (호출되기 전에 미리 정의하는 것이 안전합니다)

// [함수] 입력창 초기화
function resetInput() {
    document.getElementById('travelTitle').value = '';
    document.getElementById('travelDate').value = '';
    document.getElementById('travelNote').value = '';
    const imgPreview = document.getElementById('preview-img');
    const placeholder = document.getElementById('photo-placeholder');
    if(imgPreview) imgPreview.src = '';
    if(imgPreview) imgPreview.style.display = 'none';
    if(placeholder) placeholder.style.display = 'block';
    currentImageData = "";
}

// 검색창
function handleSearch(event) {
    event.preventDefault(); // 페이지 새로고침 방지
    const query = event.target.querySelector('input').value;
    // alert(query + "를 검색합니다!"); // 여기에 실제 검색 로직 추가
}

// [함수] 책 닫기 (에러 해결 핵심!)
function closeBook(e) {
    if (e) e.stopPropagation();
    closeAlert();
    bookContainer.classList.remove('open');
    setTimeout(() => {
        bookContainer.classList.remove('active');
        world.controls().autoRotate = true;
        world.ringsData([]);
        resetInput();
    }, 600); 
}



// [함수] 핀 업데이트
function updateMarkers() {
    // data.js에서 선언한 window.myDiaries를 사용합니다.
    world.htmlElementsData(window.myDiaries)
        .htmlLat(d => d.coords ? d.coords.lat : d.lat)  // 좌표 구조 대응
        .htmlLng(d => d.coords ? d.coords.lng : d.lng)
        .htmlElement(d => {
            const el = document.createElement('div');
            el.className = 'pin-container';
            el.style.pointerEvents = 'auto';
            el.innerHTML = `<div class="pin-label">${d.location}</div><div class="pin-icon">📍</div>`;

            el.onclick = (e) => {
                e.stopPropagation();
                currentSelectedIndex = window.myDiaries.indexOf(d); 

                const deleteBtn = document.getElementById('delete-btn');
                if (deleteBtn) deleteBtn.style.display = 'block';

                document.getElementById('locationName').innerText = d.location;
                document.getElementById('travelTitle').value = d.title || "";
                document.getElementById('travelDate').value = d.date || "";
                document.getElementById('travelNote').value = d.content || "";
                
                // 사진 처리 (d.img와 d.image 둘 다 지원)
                currentImageData = d.img || d.image || "";
                const imgPreview = document.getElementById('preview-img');
                const placeholder = document.getElementById('photo-placeholder');
                
                if (currentImageData) {
                    imgPreview.src = currentImageData;
                    imgPreview.style.display = 'block';
                    placeholder.style.display = 'none';
                } else {
                    imgPreview.src = '';
                    imgPreview.style.display = 'none';
                    placeholder.style.display = 'block';
                }

                bookContainer.classList.add('active');
                setTimeout(() => { bookContainer.classList.add('open'); }, 100);
            };

            return el;
        });
}

// 3. 지구본 초기화 및 실행
const world = Globe()
    (document.getElementById('globeViz'))
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .ringsData([])
    .ringColor(() => 'rgba(255, 100, 50, 0.8)')
    .ringMaxRadius(5)
    .showAtmosphere(true);

world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.5;

window.addEventListener('resize', () => {
  world.width(window.innerWidth);
  world.height(window.innerHeight);
});

updateMarkers(); // 저장된 핀 그리기

// 4. 나머지 기능들 (searchCity, saveDiary 등은 이전과 동일하되 함수 밖으로!)
async function searchCity() {
    const cityName = document.getElementById('city-input').value;
    if (!cityName) return;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${cityName}`);
        const data = await response.json();
        if (data.length > 0) {
            const { lat, lon } = data[0];
            world.ringsData([{ lat: parseFloat(lat), lng: parseFloat(lon) }]);
            world.controls().autoRotate = false;
            world.pointOfView({ lat: parseFloat(lat), lng: parseFloat(lon), altitude: 1.5 }, 2000);

            // searchCity 함수 내부의 setTimeout 안쪽 확인
setTimeout(() => {
    resetInput(); 
    currentSelectedIndex = -1;
    
    // 🔥 새 글 작성 시에는 삭제 버튼 숨기기
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) deleteBtn.style.display = 'none';
    
    document.getElementById('locationName').innerText = cityName.toUpperCase();
    bookContainer.classList.add('active');
    setTimeout(() => { bookContainer.classList.add('open'); }, 100);
}, 2000);
        }
    } catch (e) { console.error(e); }
}

function clearAllModals() {
    const confirmModal = document.getElementById('confirm-modal');
    const alertBox = document.getElementById('custom-alert');
    if (confirmModal) confirmModal.style.display = 'none';
    if (alertBox) alertBox.style.display = 'none';
}

// [함수 추가] 커스텀 알림 띄우기
function showAlert(msg) {
    clearAllModals();
    const alertBox = document.getElementById('custom-alert');
    const alertMsg = document.getElementById('alert-message');
    if (alertBox && alertMsg) {
        alertMsg.innerText = msg;
        alertBox.style.display = 'block';
    }
}
function closeAlert() {
    const alertBox = document.getElementById('custom-alert');
    if (alertBox) alertBox.style.display = 'none';
}
function saveDiary() {
    // 1. 입력값 가져오기
    const title = document.getElementById('travelTitle').value;
    const date = document.getElementById('travelDate').value;
    const content = document.getElementById('travelNote').value;
    const locationName = document.getElementById('locationName').innerText;
    
    // 현재 지구본이 보고 있는 중심 좌표 (새 핀 생성용)
    const { lat, lng } = world.pointOfView();

    if (!title || !content) {
        showAlert("내용을 입력해주세요! ✨");
        return;
    }

    // 2. 저장할 데이터 객체 생성
    const newEntry = { 
        // 기존 수정이면 기존 좌표 유지, 새 글이면 현재 중심 좌표 사용
        coords: (currentSelectedIndex === -1) 
            ? { lat: parseFloat(lat), lng: parseFloat(lng) } 
            : window.myDiaries[currentSelectedIndex].coords, 
        title: title, 
        date: date, 
        content: content, 
        location: locationName, 
        img: currentImageData // 혹은 image
    };
    
    // 3. 🔥 핵심: 배열 업데이트 (삭제 로직 없음!)
    if (currentSelectedIndex === -1) {
        // 새 글일 때: 배열 끝에 추가
        window.myDiaries.push(newEntry);
    } else {
        // 수정일 때: 해당 위치의 데이터를 통째로 교체 (splice 금지!)
        window.myDiaries[currentSelectedIndex] = newEntry;
    }

    // 4. 로컬 스토리지 업데이트
    localStorage.setItem('myTravelDiaries', JSON.stringify(window.myDiaries));
    
    // 5. 화면 갱신 및 알림
    updateMarkers(); 
    showAlert("📜 저장이 완료되었습니다!");

    // 6. 책 닫기 및 상태 초기화
    setTimeout(() => {
        closeBook();
        currentSelectedIndex = -1; // 인덱스 초기화 필수
        const deleteBtn = document.getElementById('delete-btn');
        if (deleteBtn) deleteBtn.style.display = 'none';
    }, 500);
}

function deleteDiary() {
    if (currentSelectedIndex === -1) return;
    clearAllModals();
    const confirmModal = document.getElementById('confirm-modal');
    if (confirmModal) {
        confirmModal.style.display = 'block';
    }
}


function closeConfirm() {
    clearAllModals();
}

// [3] 확인창에서 '삭제' 눌렀을 때: 실제 삭제 프로세스 진행
function executeDelete() {
    clearAllModals();

    // 1. 현재 인덱스가 유효한지 체크
    if (currentSelectedIndex === -1) {
        console.error("지울 대상을 찾지 못했습니다.");
        return;
    }

    // 2. 🔥 가장 확실한 방법: 배열에서 해당 인덱스를 직접 도려내기
    // 필터링(filter) 대신 splice를 쓰면 '순서'로 지우기 때문에 절대 실패 안 합니다.
    myDiaries.splice(currentSelectedIndex, 1);

    // 3. 로컬 스토리지 업데이트
    localStorage.setItem('myTravelDiaries', JSON.stringify(myDiaries));

    // 4. 🔥 맵을 완전히 비우고 다시 그리기 (강제 리프레시)
    world.htmlElementsData([]); 
    
    // 물리적으로 남아있는 핀들도 싹 청소
    const pins = document.querySelectorAll('.pin-container');
    pins.forEach(p => p.remove());

    // 5. 완료 알림
    showAlert("기록이 삭제되었습니다. ✨");

    // 6. 아주 약간의 시차를 두고 남은 데이터만 다시 뿌리기
    setTimeout(() => {
        updateMarkers(); // 이제 1개가 줄어든 myDiaries로 다시 그림
        closeBook();
        currentSelectedIndex = -1; // 인덱스 초기화
    }, 150);
}

// 이미지 관련 유틸리티
function handleImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImageData = e.target.result;
            document.getElementById('preview-img').src = currentImageData;
            document.getElementById('preview-img').style.display = 'block';
            document.getElementById('photo-placeholder').style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    }
}
function triggerUpload() { document.getElementById('image-input').click(); }

// 엔터키
document.getElementById('city-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') searchCity(); });