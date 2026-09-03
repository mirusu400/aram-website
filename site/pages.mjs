const koFaq = [
  {
    question: "ARAM은 무엇인가요?",
    answer: "ARAM은 2000년대 한국 피처폰의 WIPI 게임과 앱을 현대 환경에서 실행하기 위한 무료 오픈소스 에뮬레이터입니다. Windows, macOS, Linux, Android와 웹 브라우저를 대상으로 개발되고 있습니다.",
  },
  {
    question: "게임이나 펌웨어 파일도 제공하나요?",
    answer: "아니요. ARAM은 상용 게임, 펌웨어, 키, 메모리 덤프, 기기 폰트를 배포하지 않습니다. 직접 소유하거나 사용 권한이 있는 파일만 열어야 합니다.",
  },
  {
    question: "브라우저 버전은 파일을 서버에 업로드하나요?",
    answer: "일반적인 파일 열기는 브라우저 안에서 처리되며 ARAM 애플리케이션 서버로 업로드되지 않습니다. 무결성 확인 링크도 파일을 지정된 HTTPS 호스트에서 직접 받아 SHA-256을 확인합니다.",
  },
  {
    question: "어떤 파일 형식을 열 수 있나요?",
    answer: "현재 제품은 WIPI 애플리케이션 패키지와 JAR, DAT 입력을 다룹니다. 컨테이너를 인식했다고 해서 모든 타이틀이 완전히 플레이 가능하다는 뜻은 아니므로 호환성 단계도 함께 확인해야 합니다.",
  },
  {
    question: "모든 피처폰 게임이 실행되나요?",
    answer: "아직 아닙니다. ARAM은 인식, 로드, 실행, 첫 프레임, 플레이 가능, 완료를 서로 다른 단계로 기록합니다. 같은 이름의 게임도 통신사나 빌드 해시에 따라 결과가 달라질 수 있습니다.",
  },
  {
    question: "안정판과 개발판의 차이는 무엇인가요?",
    answer: "안정판은 태그가 붙고 검증된 권장 빌드입니다. 개발판은 main 브랜치 변경을 빠르게 반영하므로 최신 기능을 먼저 쓸 수 있지만 불안정할 수 있습니다.",
  },
  {
    question: "세이브스테이트와 되감기를 지원하나요?",
    answer: "제품 인터페이스에는 세이브스테이트와 되감기 기능이 포함되어 있습니다. 실제 사용 가능 여부는 선택한 실행 모드와 해당 타이틀의 현재 백엔드 지원 수준에 따라 달라질 수 있습니다.",
  },
  {
    question: "문제가 생기면 무엇을 보내야 하나요?",
    answer: "Help 메뉴의 리포트 기능으로 개인정보와 원본 파일을 제외한 디버그 번들을 만들 수 있습니다. 게임이나 펌웨어 원본 대신 오류 메시지, 실행 단계, 플랫폼, ARAM 버전을 함께 알려주세요.",
  },
];

const enFaq = [
  {
    question: "What is ARAM?",
    answer: "ARAM is a free, open-source emulator for Korean feature-phone WIPI games and applications from the 2000s. It targets Windows, macOS, Linux, Android, and modern web browsers.",
  },
  {
    question: "Does ARAM provide games or firmware?",
    answer: "No. ARAM does not distribute commercial games, firmware, keys, memory dumps, or device fonts. Open only files you own or are authorized to use.",
  },
  {
    question: "Does the browser version upload my file?",
    answer: "Normal file opening stays inside your browser and is not uploaded to an ARAM application server. Integrity-checked links fetch directly from the specified HTTPS host and verify the SHA-256 digest in the browser.",
  },
  {
    question: "Which input formats can it open?",
    answer: "The current product handles WIPI application packages and JAR or DAT inputs. Recognizing a container does not mean that every title is fully playable, so check the reported compatibility milestone too.",
  },
  {
    question: "Can it run every Korean feature-phone game?",
    answer: "Not yet. ARAM records recognized, loads, executes, first frame, playable, and complete as distinct milestones. Builds with the same title can behave differently by carrier or image hash.",
  },
  {
    question: "What is the difference between Stable and Nightly?",
    answer: "Stable is the recommended tagged and tested build. Nightly follows the main branch quickly, so it exposes the newest work first but may be less stable.",
  },
  {
    question: "Are save states and rewind supported?",
    answer: "The product interface includes save-state and rewind workflows. Availability depends on the selected runtime mode and the current backend support for the title.",
  },
  {
    question: "What should I include in a bug report?",
    answer: "Use the Help menu to create a redacted debug bundle that excludes the original game or firmware. Include the error message, reached milestone, platform, and ARAM version.",
  },
];

function faqBody(items, intro, links) {
  return `${intro}\n${items.map(({ question, answer }) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("\n")}\n${links}`;
}

export const pages = [
  {
    slug: "guide",
    locales: {
      ko: {
        title: "ARAM 사용법 - 피처폰 WIPI 게임 실행 가이드",
        description: "ARAM에서 소유한 WIPI·JAR·DAT 피처폰 파일을 브라우저나 Windows, macOS, Linux, Android에서 여는 방법을 안내합니다.",
        eyebrow: "GETTING STARTED",
        heading: "ARAM으로 피처폰 게임 실행하기",
        lead: "설치 없이 웹에서 시작하거나 운영체제용 앱을 내려받아, 사용 권한이 있는 WIPI 파일을 직접 열 수 있습니다.",
        body: `
    <h2>시작하기 전에</h2>
    <p>ARAM은 한국 피처폰 소프트웨어를 보존하고 연구하기 위한 에뮬레이터입니다. <strong>게임이나 펌웨어 원본은 포함하지 않으며</strong>, 직접 소유하거나 사용 허가를 받은 입력만 사용해야 합니다.</p>
    <div class="callout">처음이라면 브라우저 버전으로 화면과 메뉴를 먼저 확인해 보세요. 첫 실행에서는 약 52MB의 WebAssembly 런타임을 내려받기 때문에 네트워크 상태에 따라 잠시 걸릴 수 있습니다.</div>

    <h2>브라우저에서 실행</h2>
    <ol class="steps">
      <li><strong>웹 에뮬레이터를 엽니다.</strong><br><a href="/player/?ch=stable">안정판 ARAM 웹 플레이어</a>를 Chrome, Firefox 또는 Edge의 최신 데스크톱 버전에서 여세요.</li>
      <li><strong>런타임이 시작될 때까지 기다립니다.</strong><br>대용량 런타임을 내려받은 뒤 ARAM 화면이 나타납니다. 새로 고침을 반복하면 다운로드가 다시 시작될 수 있습니다.</li>
      <li><strong>File ▸ Open을 선택합니다.</strong><br>직접 소유하거나 사용 권한이 있는 WIPI 패키지, JAR 또는 DAT 파일을 선택하세요.</li>
      <li><strong>실행 단계를 확인합니다.</strong><br>파일 인식과 로드에 성공해도 타이틀별 서비스 차이 때문에 첫 프레임이나 플레이 가능 단계까지 도달하지 못할 수 있습니다.</li>
    </ol>

    <h2>앱을 설치해서 실행</h2>
    <div class="grid">
      <div class="card"><h3>안정판</h3><p>처음 사용하는 사람에게 권장합니다. 태그가 붙고 테스트된 최신 릴리스를 받습니다.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/latest">최신 안정판 보기</a></p></div>
      <div class="card"><h3>개발판</h3><p>가장 최근의 호환성 작업을 확인할 때 사용합니다. 최신 변경을 포함하지만 불안정할 수 있습니다.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/tag/nightly">Nightly 보기</a></p></div>
    </div>
    <p>Windows는 x64 ZIP, macOS는 Apple Silicon용 아카이브, Linux는 x64 아카이브, Android는 범용 APK를 제공합니다. 내려받은 아카이브의 체크섬은 같은 릴리스의 <code>SHA256SUMS.txt</code>로 확인할 수 있습니다.</p>

    <h2>실행 결과를 읽는 법</h2>
    <p>ARAM은 성공을 과장하지 않기 위해 <strong>인식 → 로드 → 실행 → 첫 프레임 → 플레이 가능 → 완료</strong>를 서로 다른 단계로 기록합니다. 특정 파일이 열렸다는 사실만으로 모든 기능이나 전체 플레이가 보장되지는 않습니다.</p>
    <div class="actions"><a class="button primary" href="/#download">ARAM 다운로드</a><a class="button" href="/compatibility/">호환성 기준 보기</a><a class="button" href="/troubleshooting/">문제 해결</a></div>`,
      },
      en: {
        title: "How to Use ARAM - Korean WIPI Emulator Guide",
        description: "Learn how to open authorized WIPI, JAR, and DAT feature-phone files with ARAM in a browser or on Windows, macOS, Linux, and Android.",
        eyebrow: "GETTING STARTED",
        heading: "Run Korean feature-phone software with ARAM",
        lead: "Start in the browser with no installation, or download the native app and open a WIPI file you own or are authorized to use.",
        body: `
    <h2>Before you start</h2>
    <p>ARAM is an emulator for preserving and studying Korean feature-phone software. It <strong>does not include games or firmware</strong>. Use only inputs you own or have permission to use.</p>
    <div class="callout">The browser version is the quickest way to inspect the interface. Its first launch downloads an approximately 52MB WebAssembly runtime, so startup time depends on your connection.</div>

    <h2>Run it in a browser</h2>
    <ol class="steps">
      <li><strong>Open the web emulator.</strong><br>Launch the <a href="/player/?ch=stable">Stable ARAM web player</a> in a current desktop release of Chrome, Firefox, or Edge.</li>
      <li><strong>Wait for the runtime to start.</strong><br>The ARAM screen appears after the runtime download. Repeated reloads can restart that download.</li>
      <li><strong>Choose File ▸ Open.</strong><br>Select an authorized WIPI package, JAR, or DAT file from your device.</li>
      <li><strong>Read the reached milestone.</strong><br>A recognized and loaded file may still stop before first frame or playable because titles depend on different handset services.</li>
    </ol>

    <h2>Install the native app</h2>
    <div class="grid">
      <div class="card"><h3>Stable</h3><p>Recommended for new users. It follows the latest tagged and tested release.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/latest">View the latest Stable release</a></p></div>
      <div class="card"><h3>Nightly</h3><p>Useful for checking the newest compatibility work. It moves faster and may be less stable.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/tag/nightly">View Nightly</a></p></div>
    </div>
    <p>ARAM provides a Windows x64 ZIP, an Apple Silicon macOS archive, a Linux x64 archive, and a universal Android APK. Verify an archive with the release's <code>SHA256SUMS.txt</code> when needed.</p>

    <h2>Understand compatibility results</h2>
    <p>ARAM keeps <strong>recognized → loads → executes → first frame → playable → complete</strong> as separate milestones. Opening a file does not by itself prove that every feature or a complete playthrough works.</p>
    <div class="actions"><a class="button primary" href="/en/#download">Download ARAM</a><a class="button" href="/en/compatibility/">Read compatibility criteria</a><a class="button" href="/en/troubleshooting/">Troubleshoot a problem</a></div>`,
      },
    },
  },
  {
    slug: "compatibility",
    locales: {
      ko: {
        title: "ARAM 호환성 - WIPI 게임·피처폰 지원 현황",
        description: "ARAM의 WIPI 애플리케이션 모드, 피처폰 시스템 모드, 지원 플랫폼과 호환성 단계가 무엇을 의미하는지 확인하세요.",
        eyebrow: "COMPATIBILITY",
        heading: "지원 현황을 정확하게 읽는 법",
        lead: "같은 게임 이름이라도 통신사·기기·빌드 해시에 따라 동작이 달라질 수 있어, ARAM은 호환성을 단계별로 기록합니다.",
        body: `
    <h2>두 가지 실행 모드</h2>
    <div class="grid">
      <div class="card"><h3>애플리케이션 모드</h3><p>WIPI 앱이나 게임을 직접 로드하고 화면, 소리, 입력, 저장소, 타이밍 같은 휴대폰 서비스를 에뮬레이션합니다. 현재 사용 가능한 주 실행 방식입니다.</p></div>
      <div class="card"><h3>시스템 모드</h3><p>사용자가 제공한 실제 휴대폰 펌웨어로 기기 전체를 부팅하는 연구 트랙입니다. SCH-W830과 SCH-W860 지원이 진행 중이며 아직 실험적입니다.</p></div>
    </div>

    <h2>호환성 단계</h2>
    <div class="table-wrap"><table><thead><tr><th>단계</th><th>의미</th><th>보장하지 않는 것</th></tr></thead><tbody>
      <tr><td><strong>인식</strong></td><td>파일 형식과 기본 메타데이터를 식별함</td><td>코드 로드 또는 실행</td></tr>
      <tr><td><strong>로드</strong></td><td>코드와 필요한 영역을 안전하게 메모리에 배치함</td><td>진입점 실행</td></tr>
      <tr><td><strong>실행</strong></td><td>게스트 코드가 실행되기 시작함</td><td>화면 출력</td></tr>
      <tr><td><strong>첫 프레임</strong></td><td>게스트가 첫 화면을 그림</td><td>입력·소리·저장·전체 플레이</td></tr>
      <tr><td><strong>플레이 가능</strong></td><td>핵심 조작과 진행을 실제로 확인함</td><td>모든 구간의 완주</td></tr>
      <tr><td><strong>완료</strong></td><td>정해진 검증 범위에서 전체 동작을 확인함</td><td>다른 통신사·버전 빌드</td></tr>
    </tbody></table></div>

    <h2>현재 지원 범위</h2>
    <ul>
      <li><strong>호스트:</strong> Windows, macOS, Linux, Android, 웹 브라우저</li>
      <li><strong>입력:</strong> WIPI 애플리케이션 패키지와 JAR·DAT 계열 입력</li>
      <li><strong>CPU 기준:</strong> ARMv5TE 및 Thumb 명령을 다루는 이식 가능한 Go 코어</li>
      <li><strong>도구:</strong> 상태 저장, 되감기, 입력 매핑, 디버거, 치트와 패치, 호환성 리포트의 제품 경계</li>
    </ul>
    <div class="callout">메인 페이지의 스크린샷은 ARAM에서 렌더링된 실제 예시지만, 모든 버전의 타이틀이 끝까지 플레이 가능하다는 목록은 아닙니다.</div>

    <h2>정확한 리포트를 보내는 방법</h2>
    <p>타이틀 이름만 적기보다 ARAM 버전, 플랫폼, 입력의 이미지 SHA-256, 도달한 단계, 보이는 오류를 함께 남기면 재현 가능성이 높아집니다. 원본 게임이나 펌웨어 바이트는 첨부하지 마세요.</p>
    <div class="actions"><a class="button primary" href="/guide/">실행 가이드</a><a class="button" href="https://github.com/mirusu400/aram-emu/issues">GitHub 이슈</a></div>`,
      },
      en: {
        title: "ARAM Compatibility - WIPI Games and Feature Phones",
        description: "Understand ARAM application mode, experimental handset system mode, supported hosts, inputs, and the exact meaning of each compatibility milestone.",
        eyebrow: "COMPATIBILITY",
        heading: "Read support status without overclaiming it",
        lead: "Builds with the same game title can differ by carrier, handset, and image hash, so ARAM records compatibility as explicit milestones.",
        body: `
    <h2>Two runtime modes</h2>
    <div class="grid">
      <div class="card"><h3>Application mode</h3><p>Loads a WIPI app or game directly and emulates handset services such as display, audio, input, storage, and timing. This is the primary usable path today.</p></div>
      <div class="card"><h3>System mode</h3><p>Researches booting a complete handset from user-supplied firmware. SCH-W830 and SCH-W860 work is in progress and remains experimental.</p></div>
    </div>

    <h2>Compatibility milestones</h2>
    <div class="table-wrap"><table><thead><tr><th>Milestone</th><th>What it proves</th><th>What it does not prove</th></tr></thead><tbody>
      <tr><td><strong>Recognized</strong></td><td>The format and base metadata are identified</td><td>Loading or execution</td></tr>
      <tr><td><strong>Loads</strong></td><td>Code and required regions are placed safely in memory</td><td>Entry-point execution</td></tr>
      <tr><td><strong>Executes</strong></td><td>Guest code starts running</td><td>A rendered frame</td></tr>
      <tr><td><strong>First frame</strong></td><td>The guest renders its first visible frame</td><td>Input, audio, saves, or a full playthrough</td></tr>
      <tr><td><strong>Playable</strong></td><td>Core interaction and progression were exercised</td><td>Every part of the title</td></tr>
      <tr><td><strong>Complete</strong></td><td>The defined verification scope was completed</td><td>A different carrier or build</td></tr>
    </tbody></table></div>

    <h2>Current support boundary</h2>
    <ul>
      <li><strong>Hosts:</strong> Windows, macOS, Linux, Android, and web browsers</li>
      <li><strong>Inputs:</strong> WIPI application packages and JAR or DAT family inputs</li>
      <li><strong>CPU baseline:</strong> a portable Go core covering ARMv5TE and Thumb execution</li>
      <li><strong>Product tools:</strong> state, rewind, input mapping, debugger, cheats and patches, and compatibility reporting boundaries</li>
    </ul>
    <div class="callout">Screenshots on the landing page are real rendered examples. They are not a promise that every build of each pictured title is playable from start to finish.</div>

    <h2>Write a reproducible report</h2>
    <p>Include the ARAM version, platform, input image SHA-256, reached milestone, and visible error instead of relying on a title name alone. Never attach the original game or firmware bytes.</p>
    <div class="actions"><a class="button primary" href="/en/guide/">Open the guide</a><a class="button" href="https://github.com/mirusu400/aram-emu/issues">GitHub issues</a></div>`,
      },
    },
  },
  {
    slug: "faq",
    locales: {
      ko: {
        title: "ARAM FAQ - WIPI·피처폰 에뮬레이터 자주 묻는 질문",
        description: "ARAM 피처폰 에뮬레이터의 지원 파일, 게임·펌웨어 제공 여부, 브라우저 개인정보 보호, 안정판과 개발판을 설명합니다.",
        eyebrow: "FREQUENTLY ASKED QUESTIONS",
        heading: "자주 묻는 질문",
        lead: "ARAM을 처음 실행할 때 가장 많이 궁금해하는 지원 범위, 파일, 개인정보 보호와 버전 선택을 정리했습니다.",
        faq: koFaq,
        body: faqBody(koFaq, `<p>더 구체적인 실행 순서는 <a href="/guide/">ARAM 사용법</a>, 오류별 조치는 <a href="/troubleshooting/">문제 해결 안내</a>에서 확인할 수 있습니다.</p>`, `<div class="actions"><a class="button primary" href="/player/?ch=stable">브라우저에서 실행</a><a class="button" href="https://github.com/mirusu400/aram-emu/issues">추가 질문 남기기</a></div>`),
      },
      en: {
        title: "ARAM FAQ - Korean WIPI Emulator Questions",
        description: "Answers about ARAM input formats, game and firmware distribution, browser privacy, compatibility, Stable releases, and Nightly builds.",
        eyebrow: "FREQUENTLY ASKED QUESTIONS",
        heading: "Frequently asked questions",
        lead: "Clear answers about ARAM's support boundary, authorized files, browser privacy, compatibility, and release channels.",
        faq: enFaq,
        body: faqBody(enFaq, `<p>For concrete steps, read the <a href="/en/guide/">ARAM usage guide</a>. For error-specific checks, see <a href="/en/troubleshooting/">troubleshooting</a>.</p>`, `<div class="actions"><a class="button primary" href="/player/?ch=stable">Run in your browser</a><a class="button" href="https://github.com/mirusu400/aram-emu/issues">Ask another question</a></div>`),
      },
    },
  },
  {
    slug: "releases",
    locales: {
      ko: {
        title: "ARAM 다운로드 및 릴리스 - 안정판·개발판",
        description: "Windows, macOS, Linux, Android와 브라우저용 ARAM 안정판·Nightly 개발판을 선택하고 SHA-256 체크섬을 확인하세요.",
        eyebrow: "DOWNLOADS & RELEASES",
        heading: "ARAM 버전 선택과 다운로드",
        lead: "일상 사용은 안정판, 가장 최근의 호환성 개선 확인은 Nightly 개발판을 선택하세요.",
        body: `
    <h2>어떤 채널을 선택할까요?</h2>
    <div class="grid">
      <div class="card"><h3>안정판 · 권장</h3><p>버전 태그를 붙여 배포하는 검증된 채널입니다. 처음 설치하거나 재현 가능한 환경이 필요할 때 적합합니다.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/latest">최신 안정판</a></p></div>
      <div class="card"><h3>Nightly · 최신 개발판</h3><p>main 브랜치 변경을 따라가는 롤링 빌드입니다. 최신 수정이 필요할 때 유용하지만 동작이 바뀌거나 불안정할 수 있습니다.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/tag/nightly">최신 Nightly</a></p></div>
    </div>

    <h2>플랫폼별 파일</h2>
    <div class="table-wrap"><table><thead><tr><th>플랫폼</th><th>안정판 파일명</th><th>비고</th></tr></thead><tbody>
      <tr><td>Windows</td><td><code>aram-windows-amd64.zip</code></td><td>x64</td></tr>
      <tr><td>macOS</td><td><code>aram-macos-arm64.tar.gz</code></td><td>Apple Silicon</td></tr>
      <tr><td>Linux</td><td><code>aram-linux-amd64.tar.gz</code></td><td>x64</td></tr>
      <tr><td>Android</td><td><code>aram-android-universal.apk</code></td><td>범용 APK</td></tr>
      <tr><td>웹</td><td><a href="/player/?ch=stable">브라우저에서 실행</a></td><td>첫 실행 약 52MB</td></tr>
    </tbody></table></div>

    <h2>다운로드 확인</h2>
    <p>각 릴리스에는 <code>SHA256SUMS.txt</code>가 함께 제공됩니다. 파일이 완전하게 내려받아졌는지 확인하거나 자동 배포에 사용할 때 해당 체크섬과 비교하세요. 출처가 불분명한 재배포 파일보다 공식 GitHub 릴리스를 권장합니다.</p>
    <div class="callout">Nightly에서 문제가 생기면 안정판에서도 같은지 먼저 확인하세요. 버그 리포트에는 사용한 채널과 정확한 ARAM 버전을 함께 적어 주세요.</div>
    <div class="actions"><a class="button primary" href="https://github.com/mirusu400/aram-emu/releases/latest">안정판 다운로드</a><a class="button" href="https://github.com/mirusu400/aram-emu/releases/tag/nightly">Nightly 다운로드</a><a class="button" href="/guide/">설치 후 사용법</a></div>`,
      },
      en: {
        title: "ARAM Downloads and Releases - Stable and Nightly",
        description: "Choose ARAM Stable or Nightly for Windows, macOS, Linux, Android, and the browser, and verify downloads with SHA-256 checksums.",
        eyebrow: "DOWNLOADS & RELEASES",
        heading: "Choose and download an ARAM build",
        lead: "Use Stable for normal use and Nightly when you need the most recent compatibility work.",
        body: `
    <h2>Which channel should you choose?</h2>
    <div class="grid">
      <div class="card"><h3>Stable · recommended</h3><p>The tested channel published under a version tag. Choose it for a first installation or a reproducible environment.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/latest">Latest Stable release</a></p></div>
      <div class="card"><h3>Nightly · newest development build</h3><p>A rolling build that follows the main branch. It is useful for recent fixes but can change behavior or be less stable.</p><p><a href="https://github.com/mirusu400/aram-emu/releases/tag/nightly">Latest Nightly</a></p></div>
    </div>

    <h2>Platform files</h2>
    <div class="table-wrap"><table><thead><tr><th>Platform</th><th>Stable filename</th><th>Target</th></tr></thead><tbody>
      <tr><td>Windows</td><td><code>aram-windows-amd64.zip</code></td><td>x64</td></tr>
      <tr><td>macOS</td><td><code>aram-macos-arm64.tar.gz</code></td><td>Apple Silicon</td></tr>
      <tr><td>Linux</td><td><code>aram-linux-amd64.tar.gz</code></td><td>x64</td></tr>
      <tr><td>Android</td><td><code>aram-android-universal.apk</code></td><td>Universal APK</td></tr>
      <tr><td>Web</td><td><a href="/player/?ch=stable">Run in a browser</a></td><td>About 52MB on first launch</td></tr>
    </tbody></table></div>

    <h2>Verify a download</h2>
    <p>Each release includes <code>SHA256SUMS.txt</code>. Compare it when checking a complete download or automating distribution. Prefer the official GitHub release over an unknown mirror.</p>
    <div class="callout">If Nightly fails, check whether Stable has the same problem. Include the selected channel and exact ARAM version in a bug report.</div>
    <div class="actions"><a class="button primary" href="https://github.com/mirusu400/aram-emu/releases/latest">Download Stable</a><a class="button" href="https://github.com/mirusu400/aram-emu/releases/tag/nightly">Download Nightly</a><a class="button" href="/en/guide/">Usage guide</a></div>`,
      },
    },
  },
  {
    slug: "troubleshooting",
    locales: {
      ko: {
        title: "ARAM 문제 해결 - WIPI 파일 및 웹 에뮬레이터 오류",
        description: "ARAM 웹 런타임 다운로드, WIPI·JAR·DAT 파일 열기, CORS, SHA-256 불일치와 호환성 오류를 단계별로 해결하세요.",
        eyebrow: "TROUBLESHOOTING",
        heading: "실행되지 않을 때 확인할 것",
        lead: "다운로드 문제와 파일 형식 문제, 아직 구현되지 않은 타이틀 서비스를 구분하면 원인을 더 빨리 찾을 수 있습니다.",
        body: `
    <h2>웹 플레이어가 시작되지 않음</h2>
    <ol class="steps">
      <li><strong>지원 브라우저인지 확인합니다.</strong><br>최신 데스크톱 Chrome, Firefox 또는 Edge를 먼저 사용해 보세요.</li>
      <li><strong>약 52MB 런타임 다운로드를 허용합니다.</strong><br>느린 연결, 데이터 절약 기능, 콘텐츠 차단기, 조직 네트워크 정책이 WebAssembly 파일을 막을 수 있습니다.</li>
      <li><strong>안정판과 Nightly를 바꿔 봅니다.</strong><br>한 채널의 배포가 갱신되는 동안 일시적으로 로더와 런타임 버전이 맞지 않을 수 있습니다.</li>
      <li><strong>오류 문구를 그대로 기록합니다.</strong><br><code>Failed to load runtime loader</code>와 <code>Failed to start</code>는 서로 다른 단계의 문제입니다.</li>
    </ol>

    <h2>파일이 열리지 않음</h2>
    <div class="grid">
      <div class="card"><h3>형식 인식 실패</h3><p>파일 확장자만 바꿔서는 WIPI 컨테이너가 되지 않습니다. 원본 패키지가 손상되지 않았는지와 ARAM이 다루는 WIPI·JAR·DAT 계열인지 확인하세요.</p></div>
      <div class="card"><h3>로드 후 실행 실패</h3><p>컨테이너를 인식해도 통신사 OEM 서비스, 특정 기기 동작, 아직 지원하지 않는 ARM 명령 때문에 다음 단계에서 멈출 수 있습니다.</p></div>
    </div>

    <h2>링크로 연 패키지 다운로드 실패</h2>
    <ul>
      <li>패키지 URL은 <strong>HTTPS</strong>여야 하며 사용자명이나 비밀번호를 포함할 수 없습니다.</li>
      <li>원본 호스트가 브라우저의 교차 출처 요청(CORS)을 허용해야 합니다.</li>
      <li>패키지는 32MiB 이하여야 하며 링크에 64자리 SHA-256이 함께 있어야 합니다.</li>
      <li>SHA-256 불일치는 파일이 바뀌었거나 잘못된 다이제스트를 사용했다는 뜻이므로 실행하지 않는 것이 정상입니다.</li>
    </ul>

    <h2>리포트에 포함할 정보</h2>
    <p>운영체제와 브라우저, Stable/Nightly 채널, ARAM 버전, 입력 종류, 이미지 SHA-256, 마지막으로 도달한 호환성 단계, 정확한 오류 메시지를 적어 주세요. 원본 게임·펌웨어·키·메모리 덤프는 보내지 마세요.</p>
    <div class="actions"><a class="button primary" href="https://github.com/mirusu400/aram-emu/issues">문제 신고</a><a class="button" href="/compatibility/">호환성 단계 보기</a><a class="button" href="/faq/">FAQ</a></div>`,
      },
      en: {
        title: "ARAM Troubleshooting - WIPI Files and Web Emulator",
        description: "Troubleshoot ARAM web runtime downloads, WIPI, JAR, and DAT inputs, CORS, SHA-256 mismatches, and title compatibility failures.",
        eyebrow: "TROUBLESHOOTING",
        heading: "What to check when ARAM does not run",
        lead: "Separate download failures, input-format failures, and unimplemented title services to identify the right next step quickly.",
        body: `
    <h2>The web player does not start</h2>
    <ol class="steps">
      <li><strong>Check the browser.</strong><br>Try a current desktop version of Chrome, Firefox, or Edge first.</li>
      <li><strong>Allow the approximately 52MB runtime download.</strong><br>A slow connection, data saver, content blocker, or managed-network policy can block the WebAssembly file.</li>
      <li><strong>Switch between Stable and Nightly.</strong><br>During a deployment update, a channel can temporarily have a mismatched loader and runtime.</li>
      <li><strong>Record the exact error.</strong><br><code>Failed to load runtime loader</code> and <code>Failed to start</code> identify different stages.</li>
    </ol>

    <h2>An input does not open</h2>
    <div class="grid">
      <div class="card"><h3>Format not recognized</h3><p>Renaming an extension does not turn a file into a WIPI container. Check that the original package is intact and belongs to a WIPI, JAR, or DAT family that ARAM handles.</p></div>
      <div class="card"><h3>Loads but does not execute</h3><p>A recognized container can still stop on a carrier OEM service, device-specific behavior, or an ARM instruction that is not supported yet.</p></div>
    </div>

    <h2>An integrity-checked package link fails</h2>
    <ul>
      <li>The package URL must use <strong>HTTPS</strong> and cannot contain a username or password.</li>
      <li>The source host must allow a browser cross-origin request through CORS.</li>
      <li>The package must be at most 32MiB and the link must include a 64-character SHA-256 digest.</li>
      <li>A SHA-256 mismatch means the file changed or the digest is wrong. Refusing to run it is the intended behavior.</li>
    </ul>

    <h2>Information to include in a report</h2>
    <p>Include the operating system and browser, Stable or Nightly channel, ARAM version, input kind, image SHA-256, last compatibility milestone, and exact error. Do not send the original game, firmware, keys, or a memory dump.</p>
    <div class="actions"><a class="button primary" href="https://github.com/mirusu400/aram-emu/issues">Report a problem</a><a class="button" href="/en/compatibility/">Compatibility milestones</a><a class="button" href="/en/faq/">FAQ</a></div>`,
      },
    },
  },
];
