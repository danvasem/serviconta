* Para poder utilizar la cámara del teléfono, utilizar el paquete:
    npm install react-native-camera
    Seguir las instrucciones de instalación en: https://github.com/react-native-community/react-native-camera

* Para acceder al sistema de archivos de la aplicación:
    npm install react-native-fs
    react-native link react-native-fs
    +info: https://github.com/itinance/react-native-fs

* Para ejecutar un Upload a S3 a través de Api Gateway y Lambda:
    - Crear el bucket en S3.
    - Crear un rol de seguridad en IAM para la función de Lambda.
    - Crear función lambda utilizando el rol anterior.
    - Crear API Gateway

* Para agregar Firebase al proyecto y configurar Push Notifications (ANDROID):
    - npm install react-native-firebase
    - react-native link react-native-firebase
    - seguir los pasos de: https://rnfirebase.io/docs/v5.x.x/installation/android
        NOTA: Si se produce un error luego de configurar Firebase, probar ejecutando ./android -> ./gradlew clean
    -seguir los pasos de: https://rnfirebase.io/docs/v5.x.x/messaging/android
        NOTA: Si se producen errores "extraños" siempre verificar que se están manejando las ultimas versiones de Firebase en gradle:
            https://stackoverflow.com/questions/50146640/android-studio-program-type-already-present-com-google-android-gms-internal-me
            https://firebase.google.com/support/release-notes/android#latest_sdk_versions
    - habilitar la visualización de notificaciones: https://rnfirebase.io/docs/v5.x.x/notifications/android
    - Para probar con un mensaje de prueba: https://firebase.google.com/docs/cloud-messaging/android/first-message?authuser=0#retrieve-the-current-registration-token
    - NOTA: si se quiere habilitar la recepción de mensajes cuando la aplicación está en background: https://rnfirebase.io/docs/v5.x.x/messaging/receiving-messages

    
            