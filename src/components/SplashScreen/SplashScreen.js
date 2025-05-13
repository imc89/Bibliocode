import React, { useEffect } from 'react';
import './SplashScreen.css';

// DEFINE THE COMPONENT 'splashscreen', WHICH ACCEPTS A PROP 'onfinish' SENT FROM App.js
// DEFINE EL COMPONENTE 'SplashScreen', QUE ACEPTA UNA PROP 'onFinish' ENVIADA DESDE App.js
const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    // SET A TIMER TO RUN A FUNCTION AFTER 3 SECONDS
    // ESTABLECE UN TEMPORIZADOR PARA EJECUTAR UNA FUNCION DESPUES DE 3 SEGUNDOS
    const timer = setTimeout(() => {
      if (onFinish) {
        // CALL THE 'onFinish' FUNCTION ASSOCIATED WITH handleSplashFinish METHOD OF THE App.js
        // LLAMA A LA FUNCION 'onFinish' ASOCIADA AL METODO handleSplashFinish DEL App.js
        onFinish();
      }
    }, 3000);
    // CLEAN THE TIMER WHEN THE COMPONENT IS DISASSEMBLED
    // LIMPIA EL TEMPORIZADOR CUANDO EL COMPONENTE SE DESMONTA
    return () => clearTimeout(timer);
  }, [onFinish]);
  // THE METHOD EXECUTES WHEN CHANGING THE 'onFinish' PROPERTY
  // EL MÉTODO EJECUTA AL CAMBIAR LA PROPIEDAD 'onFinish'

  return (
    <div className="splash-screen">
      <img src={`${process.env.PUBLIC_URL}/shadow.png`} alt="Logo" className="splash-logo" />
      <span className='splash-text'>Bibliocode</span>
    </div>
  );
};

export default SplashScreen;