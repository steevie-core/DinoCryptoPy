from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt5.QtWebEngineWidgets import QWebEngineView
import sys

class FakeBrowser(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Fake Browser - TsukaSolutions")
        self.setGeometry(100, 100, 1024, 768)

        self.browser = QWebEngineView()
        # Load your local HTML file or a string with HTML content
        self.browser.setHtml(open("tsukasolutions.html").read())

        central_widget = QWidget()
        layout = QVBoxLayout()
        layout.addWidget(self.browser)
        central_widget.setLayout(layout)

        self.setCentralWidget(central_widget)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = FakeBrowser()
    window.show()
    sys.exit(app.exec_())
