function sendMessage() {
  const input = document.querySelector('.chat-panel__input-container')
  const button = document.querySelector('.chat-send__button')
  const pd = document.getElementById('paramsContainer')
  const message = pd.getAttribute('message')

  if (input) {
    const event = new Event('input', { bubbles: true })
    input.value = message
    input.dispatchEvent(event)

    setTimeout(() => {
      button.click()
    }, 50)
  }
}
sendMessage()
