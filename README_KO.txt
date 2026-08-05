USVisaPhoto Alignment 전체 롤백 패치

이 패치는 Alignment 코드를 넣기 직전 상태로 아래 파일을 복원합니다.
- components/uploadBoxV2/logic.ts
- components/uploadBoxV2/index.ts
- src/photo-engine/client-script/index.ts
- src/photo-engine/client-script/uploadBoxPhotoEngine.ts

그리고 아래 폴더를 삭제합니다.
- src/photo-engine/client-script/correction

적용 방법
1. 현재 npm run dev 터미널에서 Ctrl+C
2. 이 ZIP을 프로젝트 루트(C:\Users\user\usvisaphoto)에 압축 해제
3. PowerShell에서 프로젝트 루트로 이동
4. 아래 명령 실행
   powershell -ExecutionPolicy Bypass -File .\rollback-alignment.ps1
5. npm run dev
6. 브라우저 Ctrl+Shift+R

이 패치는 Color Engine 파일(lib/color-engine.ts, app/api/final-photo/route.ts)은 건드리지 않습니다.
