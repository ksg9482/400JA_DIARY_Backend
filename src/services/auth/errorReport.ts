type ErrorWithMessage = {
    message: string;
}

//if문 판단으로 들어간다.
function isErrorWithMessage(error: unknown):error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    )
};

//error를 제대로 console.log로 못잡았던 이유는 JSON으로 보내서? 객체처럼 보려고 했다가 문자열이니 못봤을 수 밖에. 그렇다면 name이나 message는 JSON parse해서 내용 보여주는 기능인 듯
function toErrorWithMessage(maybeError: unknown):ErrorWithMessage {
    if(isErrorWithMessage(maybeError)) return maybeError;

    try {
        return new Error(JSON.stringify(maybeError));
    } catch (error) {
        return new Error(String(maybeError));
    };
};

function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message;
}
//처리중인 오류객체가 실제오류가 아닌 상황을 처리하기 위한 제안 추가
//가능한 경우 오류객체를 문자열화 하는 제안 추가.



try {
    throw new Error('Oh no!');
    //사실 throw는 뭐든지 던질 수 있다. null, undefined, 숫자, 문자 다 가능하다. 심지어 Promise를 던질 수도 있다.
    //따라서 error가 에러만 던질 것임을 추가해야 한다.
} catch (error) { 
    //타입스크립트는 기본적으로 error type을 unknown으로 잡았다.
    //실제로 타입을 Error로 잡으면 에러타입은 any 또는 unknown이라며 컴파일 에러를 보낸다.
    //이는 다른 라이브러리에서 보내는 에러가 Error타입으로 지정이 되어있지 않아도 다 잡아 보내야 하기 때문이라고 한다.
  
}