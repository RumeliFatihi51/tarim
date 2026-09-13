; NSIS Modern User Interface Script for Windows EXE Installer
; TerraSat AI Workstation 2026 Enterprise Edition

!define PRODUCT_NAME "TerraSat AI Workstation"
!define PRODUCT_VERSION "3.0.0"
!define PRODUCT_PUBLISHER "TerraSat Geospatial AI Inc."
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\TerraSatWorkstation.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

SetCompressor /SOLID lzma
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "..\dist-installer\TerraSat_AI_Workstation_Setup_v3.0.0.exe"
InstallDir "$PROGRAMFILES64\TerraSat AI Workstation"
InstallDirRegKey HKLM "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite try
  File /r "..\dist\win-unpacked\*.*"
  CreateDirectory "$SMPROGRAMS\TerraSat AI Workstation"
  CreateShortCut "$SMPROGRAMS\TerraSat AI Workstation\TerraSat AI Workstation.lnk" "$INSTDIR\TerraSatWorkstation.exe"
  CreateShortCut "$DESKTOP\TerraSat AI Workstation.lnk" "$INSTDIR\TerraSatWorkstation.exe"
SectionEnd

Section -Post
  WriteUninstaller "$INSTDIR\uninst.exe"
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\TerraSatWorkstation.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\TerraSatWorkstation.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd
