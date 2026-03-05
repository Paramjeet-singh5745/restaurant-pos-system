const initialState = {
  isAuthenticated: false,
  restaurant: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        restaurant: action.payload,
      };

    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        restaurant: null,
      };

    default:
      return state;
  }
};

export default authReducer;
