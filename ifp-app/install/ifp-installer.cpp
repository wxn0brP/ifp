#include <iostream>

int main(){
    std::cout << "Poczekaj az instalator pobierze potrzebne pliki.\n\n";
    system("curl https://ifp.projektares.tk/ele-app/rele/install.exe -o \"ifp Setup 0.0.1.exe\"");
    system("\"ifp Setup 0.0.1.exe\"");
    return 0;
}
