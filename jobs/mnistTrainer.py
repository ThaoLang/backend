import sys

import torch
import torchvision
import torchvision.transforms as transforms


def train_mnist(job_id, learning_rate, batch_size, epochs):
    transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
    trainset = torchvision.datasets.MNIST(root='./data', train=True, download=True, transform=transform)
    trainloader = torch.utils.data.DataLoader(trainset, batch_size=batch_size, shuffle=True)

    model = torch.nn.Sequential(
        torch.nn.Flatten(),
        torch.nn.Linear(28 * 28, 128),
        torch.nn.ReLU(),
        torch.nn.Linear(128, 10)
    )

    criterion = torch.nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)

    for epoch in range(epochs):
        running_loss = 0.0
        correct = 0
        total = 0
        for inputs, labels in trainloader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()

            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        accuracy = 100 * correct / total
        accuracy = round(accuracy, 2)
        loss = round(running_loss / len(trainloader), 2)
        
        
        print(f"Epoch {epoch+1}, Loss: {loss}, Accuracy: {accuracy}%")
        sys.stdout.flush()

if __name__ == "__main__":
    job_id = sys.argv[1]
    learning_rate = float(sys.argv[2])
    batch_size = int(sys.argv[3])
    epochs = int(sys.argv[4])

    train_mnist(job_id, learning_rate, batch_size, epochs)
