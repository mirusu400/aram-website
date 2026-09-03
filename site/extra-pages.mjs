export const extraPages = [
  {
    slug: "download",
    locales: {
      ko: {
        title: "ARAM 피처폰 게임 에뮬레이터 PC·안드로이드 다운로드",
        description: "한국 피처폰의 WIPI·SKVM·Raptor 게임과 앱을 실행하는 ARAM을 Windows PC, macOS, Linux, Android 또는 웹 브라우저에서 이용하세요.",
        eyebrow: "DOWNLOAD",
        heading: "ARAM 피처폰 게임 에뮬레이터 다운로드",
        lead: "ARAM Emulator는 Windows PC, macOS, Linux, Android와 웹 브라우저에서 사용할 수 있습니다. 처음이라면 설치 없는 웹 버전이나 최신 안정판을 선택하세요.",
        body: `
    <p>피처폰은 흔히 <strong>피쳐폰</strong>으로도 검색됩니다. ARAM은 한국 피처폰의 WIPI·SKVM·Raptor 계열 게임과 소프트웨어를 현대 환경에서 실행하는 오픈소스 에뮬레이터이며, 타이틀별 동작 범위는 <a href="/compatibility/">호환성 단계</a>에 따라 다릅니다.</p>
    <div class="callout"><strong>게임이나 펌웨어는 포함하지 않습니다.</strong> 직접 소유하거나 사용 권한이 있는 파일만 사용하세요. 공식 배포 파일은 ARAM GitHub 릴리스에서만 내려받는 것을 권장합니다.</div>

    <h2>플랫폼별 선택</h2>
    <div class="table-wrap"><table><thead><tr><th>환경</th><th>파일 또는 실행 방법</th><th>대상</th></tr></thead><tbody>
      <tr><td>웹 브라우저</td><td><a href="/player/?ch=stable">설치 없이 실행</a></td><td>최신 데스크톱 Chrome, Firefox, Edge</td></tr>
      <tr><td>Windows PC</td><td><a href="https://github.com/mirusu400/aram-emu/releases/latest/download/aram-windows-amd64.zip"><code>aram-windows-amd64.zip</code></a></td><td>x64</td></tr>
      <tr><td>macOS</td><td><a href="https://github.com/mirusu400/aram-emu/releases/latest/download/aram-macos-arm64.tar.gz"><code>aram-macos-arm64.tar.gz</code></a></td><td>Apple Silicon</td></tr>
      <tr><td>Linux</td><td><a href="https://github.com/mirusu400/aram-emu/releases/latest/download/aram-linux-amd64.tar.gz"><code>aram-linux-amd64.tar.gz</code></a></td><td>x64</td></tr>
      <tr><td>Android</td><td><a href="https://github.com/mirusu400/aram-emu/releases/latest/download/aram-android-universal.apk"><code>aram-android-universal.apk</code></a></td><td>범용 APK</td></tr>
    </tbody></table></div>

    <h2>PC에서 시작하기</h2>
    <ol class="steps">
      <li><strong>운영체제용 안정판을 받습니다.</strong><br>위 표의 공식 GitHub 링크에서 파일을 내려받으세요.</li>
      <li><strong>체크섬을 확인합니다.</strong><br><a href="https://github.com/mirusu400/aram-emu/releases/latest/download/SHA256SUMS.txt"><code>SHA256SUMS.txt</code></a>와 받은 파일의 SHA-256을 비교할 수 있습니다.</li>
      <li><strong>압축을 풀고 ARAM을 실행합니다.</strong><br><code>File ▸ Open</code>에서 사용 권한이 있는 WIPI 패키지, JAR 또는 DAT 입력을 선택하세요.</li>
      <li><strong>도달한 실행 단계를 기록합니다.</strong><br>인식, 로드, 실행, 첫 프레임, 플레이 가능, 완료는 서로 다른 결과입니다.</li>
    </ol>

    <h2>안정판과 Nightly</h2>
    <div class="grid">
      <div class="card"><h3>안정판 · 권장</h3><p>버전 태그와 함께 배포되는 재현 가능한 빌드입니다. 처음 설치할 때 선택하세요.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/latest">최신 안정판</a></p></div>
      <div class="card"><h3>Nightly · 개발판</h3><p>최근 변경을 빠르게 확인할 수 있지만 동작이 바뀌거나 불안정할 수 있습니다.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/tag/nightly">최신 Nightly</a></p></div>
    </div>
    <div class="actions"><a class="button primary" href="/guide/">피처폰 게임 실행 방법</a><a class="button" href="/releases/">버전별 릴리스 노트</a></div>`,
      },
      en: {
        title: "Download ARAM Emulator for PC, Android, macOS, Linux and Web",
        description: "Download ARAM for Windows PC, macOS, Linux, or Android, or run the Korean feature-phone WIPI, SKVM, and Raptor emulator in a browser.",
        eyebrow: "DOWNLOAD",
        heading: "Download the ARAM feature-phone emulator",
        lead: "ARAM Emulator runs on Windows PCs, macOS, Linux, Android, and modern web browsers. Start with the installation-free web build or the latest Stable release.",
        body: `
    <p>ARAM is an open-source emulator for Korean feature-phone WIPI, SKVM, and Raptor-family games and software. Exact behavior varies by title and build, so use the <a href="/en/compatibility/">compatibility milestones</a> instead of assuming broad support.</p>
    <div class="callout"><strong>No game or firmware files are included.</strong> Use only files you own or are authorized to use. Prefer downloads from the official ARAM GitHub release.</div>

    <h2>Choose a platform</h2>
    <div class="table-wrap"><table><thead><tr><th>Environment</th><th>File or launch method</th><th>Target</th></tr></thead><tbody>
      <tr><td>Web browser</td><td><a href="/player/?ch=stable">Run without installing</a></td><td>Current desktop Chrome, Firefox, or Edge</td></tr>
      <tr><td>Windows PC</td><td><a href="https://github.com/mirusu400/aram-emu/releases/latest/download/aram-windows-amd64.zip"><code>aram-windows-amd64.zip</code></a></td><td>x64</td></tr>
      <tr><td>macOS</td><td><a href="https://github.com/mirusu400/aram-emu/releases/latest/download/aram-macos-arm64.tar.gz"><code>aram-macos-arm64.tar.gz</code></a></td><td>Apple Silicon</td></tr>
      <tr><td>Linux</td><td><a href="https://github.com/mirusu400/aram-emu/releases/latest/download/aram-linux-amd64.tar.gz"><code>aram-linux-amd64.tar.gz</code></a></td><td>x64</td></tr>
      <tr><td>Android</td><td><a href="https://github.com/mirusu400/aram-emu/releases/latest/download/aram-android-universal.apk"><code>aram-android-universal.apk</code></a></td><td>Universal APK</td></tr>
    </tbody></table></div>

    <h2>Get started on a computer</h2>
    <ol class="steps">
      <li><strong>Download the Stable build for your operating system.</strong><br>Use an official GitHub link in the table above.</li>
      <li><strong>Verify the archive.</strong><br>Compare its SHA-256 with <a href="https://github.com/mirusu400/aram-emu/releases/latest/download/SHA256SUMS.txt"><code>SHA256SUMS.txt</code></a>.</li>
      <li><strong>Extract and start ARAM.</strong><br>Use <code>File ▸ Open</code> to select an authorized WIPI package, JAR, or DAT input.</li>
      <li><strong>Record the reached milestone.</strong><br>Recognized, loads, executes, first frame, playable, and complete are different results.</li>
    </ol>

    <h2>Stable or Nightly</h2>
    <div class="grid">
      <div class="card"><h3>Stable · recommended</h3><p>A reproducible build published under a version tag. Choose it for a first installation.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/latest">Latest Stable</a></p></div>
      <div class="card"><h3>Nightly · development</h3><p>Provides recent changes quickly but can change behavior or be less stable.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/tag/nightly">Latest Nightly</a></p></div>
    </div>
    <div class="actions"><a class="button primary" href="/en/guide/">How to run a feature-phone game</a><a class="button" href="/en/releases/">Release notes by version</a></div>`,
      },
    },
  },
  {
    slug: "press",
    locales: {
      ko: {
        title: "ARAM Emulator 보도자료·미디어 키트",
        description: "ARAM Emulator의 한 줄 소개, 확인 가능한 제품 정보, 로고, 실제 스크린샷, 링크와 보도·블로그 작성 지침을 제공합니다.",
        eyebrow: "PRESS KIT",
        heading: "ARAM Emulator 미디어 키트",
        lead: "ARAM Emulator는 2000년대 한국 피처폰의 WIPI·SKVM·Raptor 계열 소프트웨어를 PC, Android와 웹에서 다시 실행하기 위한 오픈소스 에뮬레이터입니다.",
        body: `
    <div class="callout"><strong>권장 한 줄 소개</strong><br>ARAM Emulator는 사용자가 소유하거나 사용 허가를 받은 한국 피처폰 소프트웨어를 현대 PC·Android·웹 브라우저에서 실행하고 연구할 수 있게 하는 오픈소스 프로젝트입니다.</div>

    <h2>확인 가능한 제품 정보</h2>
    <div class="table-wrap"><table><tbody>
      <tr><th>공식 표기</th><td>ARAM Emulator 또는 ARAM WIPI Emulator</td></tr>
      <tr><th>대상</th><td>한국 피처폰 WIPI·SKVM·Raptor 계열 앱과 게임, 실험적 삼성 피처폰 시스템 모드</td></tr>
      <tr><th>호스트</th><td>Windows, macOS, Linux, Android, 웹 브라우저</td></tr>
      <tr><th>배포</th><td>무료 공개 GitHub 릴리스와 설치 없는 웹 빌드</td></tr>
      <tr><th>원본 파일</th><td>게임·펌웨어·키·메모리 덤프를 배포하지 않음</td></tr>
      <tr><th>호환성 원칙</th><td>버전·날짜·입력 해시별로 도달한 실행 단계만 주장</td></tr>
    </tbody></table></div>

    <h2>로고와 실제 화면</h2>
    <p>아래 파일은 ARAM 사이트에서 사용하는 공식 프로젝트 이미지입니다. 기사나 프로젝트 소개에서는 파일의 비율을 유지하고, 화면이 모든 타이틀의 완전한 호환성을 뜻하지 않는다는 점을 함께 밝혀 주세요.</p>
    <ul>
      <li><a href="/assets/icon.png">ARAM 로고 PNG</a></li>
      <li><a href="/assets/og-ko.png">한국어 소셜 카드 1200×630</a></li>
      <li><a href="/assets/og-en.png">영문 소셜 카드 1200×630</a></li>
      <li><a href="/assets/shots/shot-01.png">실제 화면 1</a> · <a href="/assets/shots/shot-02.png">실제 화면 2</a> · <a href="/assets/shots/shot-03.png">실제 화면 3</a> · <a href="/assets/shots/shot-04.png">실제 화면 4</a> · <a href="/assets/shots/shot-05.png">실제 화면 5</a> · <a href="/assets/shots/shot-06.png">실제 화면 6</a></li>
      <li><a href="/player/?ch=stable">설치 없는 실제 웹 데모</a></li>
    </ul>

    <h2>인용할 때 지켜야 할 범위</h2>
    <ul>
      <li>ARAM만 쓰기보다 <strong>ARAM Emulator</strong> 또는 <strong>ARAM WIPI Emulator</strong>로 표기합니다.</li>
      <li>특정 게임·기종의 지원을 언급할 때는 <a href="/compatibility/">호환성 페이지</a>의 버전, 검증일과 단계를 함께 씁니다.</li>
      <li>릴리스 노트의 기능 소개와 끝까지 검증된 호환성 결과를 같은 의미로 인용하지 않습니다.</li>
      <li>게임·펌웨어 파일을 ARAM이 제공한다고 표현하지 않습니다.</li>
    </ul>

    <h2>소스, 재사용 조건과 문의</h2>
    <p>소스와 릴리스는 <a href="https://github.com/mirusu400/aram-emu">공식 GitHub 저장소</a>에서 확인할 수 있습니다. 프로젝트 전체의 통합 배포 라이선스가 별도로 명시되기 전에는 코드·바이너리·미디어의 재사용 조건을 각 저장소의 고지와 관리자에게 확인해야 합니다. 기사 확인이나 인터뷰 문의는 <a href="https://github.com/mirusu400/aram-website/issues">aram-website 이슈</a>로 남겨 주세요.</p>
    <div class="actions"><a class="button primary" href="/guide/">사용법</a><a class="button" href="/releases/">릴리스 자료</a><a class="button" href="https://github.com/mirusu400/aram-emu">GitHub</a></div>`,
      },
      en: {
        title: "ARAM Emulator Press Kit and Media Resources",
        description: "Use ARAM Emulator's approved one-line description, verified product facts, logo, real screenshots, official links, and reporting guidance.",
        eyebrow: "PRESS KIT",
        heading: "ARAM Emulator press kit",
        lead: "ARAM Emulator is an open-source project for running Korean feature-phone WIPI, SKVM, and Raptor-family software from the 2000s on PCs, Android, and the web.",
        body: `
    <div class="callout"><strong>Suggested one-line description</strong><br>ARAM Emulator lets people run and study Korean feature-phone software they own or are authorized to use on modern PCs, Android devices, and web browsers.</div>

    <h2>Verified product facts</h2>
    <div class="table-wrap"><table><tbody>
      <tr><th>Preferred name</th><td>ARAM Emulator or ARAM WIPI Emulator</td></tr>
      <tr><th>Scope</th><td>Korean feature-phone WIPI, SKVM, and Raptor-family apps and games, plus an experimental Samsung handset system mode</td></tr>
      <tr><th>Hosts</th><td>Windows, macOS, Linux, Android, and web browsers</td></tr>
      <tr><th>Distribution</th><td>Public GitHub releases and an installation-free web build</td></tr>
      <tr><th>Original files</th><td>No games, firmware, keys, or memory dumps are distributed</td></tr>
      <tr><th>Compatibility rule</th><td>Claims only the reached milestone for an exact version, date, and input hash</td></tr>
    </tbody></table></div>

    <h2>Logo and real screens</h2>
    <p>These are official project images used by the ARAM website. Preserve their aspect ratio and make clear that a screenshot is not a promise of complete compatibility for every title.</p>
    <ul>
      <li><a href="/assets/icon.png">ARAM logo PNG</a></li>
      <li><a href="/assets/og-ko.png">Korean social card, 1200×630</a></li>
      <li><a href="/assets/og-en.png">English social card, 1200×630</a></li>
      <li><a href="/assets/shots/shot-01.png">Real screen 1</a> · <a href="/assets/shots/shot-02.png">Real screen 2</a> · <a href="/assets/shots/shot-03.png">Real screen 3</a> · <a href="/assets/shots/shot-04.png">Real screen 4</a> · <a href="/assets/shots/shot-05.png">Real screen 5</a> · <a href="/assets/shots/shot-06.png">Real screen 6</a></li>
      <li><a href="/player/?ch=stable">Live installation-free web demo</a></li>
    </ul>

    <h2>Reporting boundaries</h2>
    <ul>
      <li>Use <strong>ARAM Emulator</strong> or <strong>ARAM WIPI Emulator</strong> rather than ARAM alone.</li>
      <li>When naming support for a game or handset, include the version, verification date, and milestone from the <a href="/en/compatibility/">compatibility page</a>.</li>
      <li>Do not treat a release feature announcement as proof of an end-to-end compatibility result.</li>
      <li>Do not imply that ARAM supplies game or firmware files.</li>
    </ul>

    <h2>Source, reuse terms, and contact</h2>
    <p>Source and releases are available from the <a href="https://github.com/mirusu400/aram-emu">official GitHub repository</a>. Until unified product distribution terms are published, confirm reuse terms for code, binaries, and media from each repository's notices and its maintainer. For fact checks or interview requests, open an <a href="https://github.com/mirusu400/aram-website/issues">aram-website issue</a>.</p>
    <div class="actions"><a class="button primary" href="/en/guide/">Usage guide</a><a class="button" href="/en/releases/">Release resources</a><a class="button" href="https://github.com/mirusu400/aram-emu">GitHub</a></div>`,
      },
    },
  },
];
