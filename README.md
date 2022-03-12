# README #

This Vagrantfile will create a full blown XFCE desktop environment within a VM for CER/AIT developers to use when doing local development tasks on their machines.

### How do I get set up? ###

Two steps: 

1. Install Vagrant
2. Install Parallels. 


### Provisioning the VM ###

1. Clone the repo
2. Switch into the root of the repository
3. Run `vagrant up`

That's it, literally. The rest should be fully automated.

### Customizing ###

The easiest way to customize the VM is to copy config.yml to wfu-config.yml and edit it directly. This way you can set RAM, CPU and software requirements at provision time. If you have already run `vagrant up`, you should use `vagrant provision` instead to apply your changes. If you need more flexibility, you can also use your own Ansible scripts pre and post provisioning. These are left to the individual developer.


### Making a backup ###

If you want to make a backup of your VM in case you do something to break the install, just use the `vagrant snapshot` command family to make snapshots and restore them.

### Shutting down/rebuilding the VM ###

Easy: `vagrant destroy` will stop the VM and remove it. If you want to re-provision after that, use `vagrant up` again.

## CER Set Up

These steps need to be done after running vagrant provision.  We'll create a 
shell script to do all this in one command.

[Set Up Instructions](https://docs.google.com/document/d/1F_nWCbPmr-Og0kIufWXHB5j0isJrSTCW9HDkrihvPD4)

### CER Workflow

[Learn about custom scripts for use in VDL](https://github.com/wakeforestuniversity/vagrant-aws-pci/playbooks/files/README.md)

