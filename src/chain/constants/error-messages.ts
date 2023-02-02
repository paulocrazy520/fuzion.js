export class ErrorMessages {

    //We use this message when there is no error code at all.
    public static GENERAL_ERROR_CODE_UNAVAILABLE = 'Error code unavailable.'

    //We use this message when we extract an error code successfully, but there is no custom message defined for that error code.
    public static GENERAL_ERROR_CODE_UNRECOGNISED = 'Error code unrecognised.'

    //These messages map 1 to 1 with an error code, for the OTC contract.
    public static OTC_ERROR_18 = 'Got error code 18, in OTC contract.'
    public static OTC_ERROR_19 = 'Got error code 19, in OTC contract.'

    //These messages map 1 to 1 with an error code, for the Utils contract.
    public static UTILS_ERROR_18 = 'Got error code 18, in Utils contract.'
    public static UTILS_ERROR_19 = 'Got error code 19. in Utils contract.'
}

