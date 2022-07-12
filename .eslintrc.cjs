module.exports = {
    // "env": {
    //     "browser": true,
    //     "es2021": true
    // },
    "extends": [
        "plugin:@typescript-eslint/recommended", //@typescript-eslint/recommended의 권장규칙을 사용한다
        "prettier/@typescript-eslint", //eslint-config-prettier를 사용하여 @typescript-eslint/eslint-plugin에서 상위항목과 충돌하는 eslint규칙을 사용하지 않도록 한다
        "plugin:prettier/recommended" //eslint-plugin-pretier를 사용하도록 설정하고 prettier에러를 eslint에러로 표시한다. 이 항목은 항상 extends의 마지막이어야 한다. 
    ],
    "parser": "@typescript-eslint/parser", //eslint parser를 명시한다
    "parserOptions": {
        "ecmaVersion": "latest", //ECMAScript의 어떤 버전을 따를 것인지
        "sourceType": "module" //import는 어떤 방식을 따를 것인지
    },
    // "plugins": [
    //     "@typescript-eslint"
    // ],
    "rules": {
        '@typescript-eslint/explicit-member-accessibility': 0, //클래스 속성 및 메서드에 대한 명시적 접근성 수정자를 필요하게 한다
        '@typescript-eslint/explicit-function-return-type': 0, //함수 및 클래스 메서드에 대한 명식적 타입 반환을 필요하게 한다
        '@typescript-eslint/no-parameter-properties': 0, //클래스 생성자에서 매개변수 속성을 사용할 수 없게 한다
        '@typescript-eslint/interface-name-prefix': 0 //인터페이스 이름에 접두사가 필요하게 한다.
    }
}
