import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function App() {
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }
  ]);

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const currentQuiz = quizzes[currentQuizIndex];

  const handleInputChange = (field, value) => {
    const updatedQuizzes = [...quizzes];
    updatedQuizzes[currentQuizIndex] = {
      ...updatedQuizzes[currentQuizIndex],
      [field]: value
    };
    setQuizzes(updatedQuizzes);
  };

  const handleOptionChange = (index, value) => {
    const updatedQuizzes = [...quizzes];
    const newOptions = [...updatedQuizzes[currentQuizIndex].options];
    newOptions[index] = value;
    updatedQuizzes[currentQuizIndex] = {
      ...updatedQuizzes[currentQuizIndex],
      options: newOptions
    };
    setQuizzes(updatedQuizzes);
  };

  const handleCorrectAnswerChange = (value) => {
    const updatedQuizzes = [...quizzes];
    updatedQuizzes[currentQuizIndex] = {
      ...updatedQuizzes[currentQuizIndex],
      correctAnswer: parseInt(value)
    };
    setQuizzes(updatedQuizzes);
  };

  const addQuiz = () => {
    if (quizzes.length < 5) {
      const newQuiz = {
        id: Date.now(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      };
      setQuizzes([...quizzes, newQuiz]);
      setCurrentQuizIndex(quizzes.length);
    }
  };

  const removeQuiz = (index) => {
    if (quizzes.length > 1) {
      const updatedQuizzes = quizzes.filter((_, i) => i !== index);
      setQuizzes(updatedQuizzes);
      if (currentQuizIndex >= updatedQuizzes.length) {
        setCurrentQuizIndex(updatedQuizzes.length - 1);
      }
    }
  };

  const generatePDF = async () => {
    const element = document.getElementById('quiz-print');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('english-quiz.pdf');
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成中にエラーが発生しました。');
    }
  };

  const printQuiz = () => {
    window.print();
  };

  const clearAllQuizzes = () => {
    setQuizzes([{
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }]);
    setCurrentQuizIndex(0);
    setShowPreview(false);
  };

  const isFormValid = () => {
    return currentQuiz.question.trim() !== '' && 
           currentQuiz.options.every(option => option.trim() !== '');
  };

  const areAllQuizzesValid = () => {
    return quizzes.every(quiz => 
      quiz.question.trim() !== '' && 
      quiz.options.every(option => option.trim() !== '')
    );
  };

  return (
    <div className="container">
      <div className="header">
        <h1>英語4択問題作成アプリ</h1>
        <p>英文と選択肢を入力して、印刷用の問題を作成しましょう（最大5問）</p>
      </div>

      <div className="content">
        <div className="quiz-navigation">
          <h2>問題管理</h2>
          <div className="quiz-tabs">
            {quizzes.map((quiz, index) => (
              <button
                key={quiz.id}
                className={`quiz-tab ${currentQuizIndex === index ? 'active' : ''}`}
                onClick={() => setCurrentQuizIndex(index)}
              >
                問題 {index + 1}
                {quizzes.length > 1 && (
                  <span 
                    className="remove-quiz"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuiz(index);
                    }}
                  >
                    ×
                  </span>
                )}
              </button>
            ))}
            {quizzes.length < 5 && (
              <button className="add-quiz-btn" onClick={addQuiz}>
                + 問題追加
              </button>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>問題 {currentQuizIndex + 1} の作成</h2>
          
          <div className="form-group">
            <label htmlFor="question">英文（問題文）</label>
            <textarea
              id="question"
              value={currentQuiz.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="例: Choose the correct word to complete the sentence: I ___ to school every day. (a) go (b) goes (c) going (d) went"
            />
          </div>

          <div className="form-group">
            <label>選択肢</label>
            <div className="options-container">
              {currentQuiz.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`option-group ${currentQuiz.correctAnswer === index ? 'correct' : ''}`}
                >
                  <label>選択肢 {String.fromCharCode(65 + index)}</label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`選択肢 ${String.fromCharCode(65 + index)} を入力`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group correct-option">
            <label htmlFor="correctAnswer">正解の選択肢</label>
            <select
              id="correctAnswer"
              value={currentQuiz.correctAnswer}
              onChange={(e) => handleCorrectAnswerChange(e.target.value)}
            >
              {currentQuiz.options.map((_, index) => (
                <option key={index} value={index}>
                  {String.fromCharCode(65 + index)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="explanation">解説（オプション）</label>
            <textarea
              id="explanation"
              value={currentQuiz.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="正解の理由や解説を入力してください"
            />
          </div>

          <div className="button-group">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowPreview(true)}
              disabled={!isFormValid()}
            >
              プレビュー表示
            </button>
            <button className="btn btn-secondary" onClick={clearAllQuizzes}>
              すべてクリア
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="preview-section">
            <h2>プレビュー</h2>
            <div id="quiz-print" className="quiz-preview">
              {quizzes.map((quiz, index) => (
                <div key={quiz.id} className="quiz-item">
                  <h3>問題 {index + 1}</h3>
                  <div className="quiz-question">
                    <strong>問題:</strong> {quiz.question}
                  </div>
                  <div className="quiz-options">
                    {quiz.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="quiz-option">
                        <strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option}
                      </div>
                    ))}
                  </div>
                  {quiz.explanation && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>解説:</strong> {quiz.explanation}
                    </div>
                  )}
                  {index < quizzes.length - 1 && <hr style={{ margin: '30px 0', border: '1px solid #e1e5e9' }} />}
                </div>
              ))}
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-success" 
                onClick={generatePDF}
                disabled={!areAllQuizzesValid()}
              >
                PDFダウンロード
              </button>
              <button 
                className="btn btn-primary" 
                onClick={printQuiz}
                disabled={!areAllQuizzesValid()}
              >
                印刷
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 